// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/MorphoAllocator.sol";

interface VmMorphoAllocator {
    function warp(uint256 newTimestamp) external;
    function prank(address msgSender) external;
}

contract MockAllocatorUSDC {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "BALANCE");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "BALANCE");
        require(allowance[from][msg.sender] >= amount, "ALLOWANCE");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockMorphoBlue {
    MockAllocatorUSDC public immutable usdc;
    bytes32 public immutable marketId;
    IMorphoBlue.MarketParams private params;
    IMorphoBlue.Market private state;
    mapping(address => IMorphoBlue.Position) private positions;

    constructor(MockAllocatorUSDC usdc_, bytes32 marketId_) {
        usdc = usdc_;
        marketId = marketId_;
        params = IMorphoBlue.MarketParams({
            loanToken: address(usdc_),
            collateralToken: address(0xC011A7E),
            oracle: address(0x0A11CE),
            irm: address(0x1A110C),
            lltv: 860000000000000000
        });
    }

    function idToMarketParams(bytes32 id) external view returns (IMorphoBlue.MarketParams memory) {
        require(id == marketId, "MARKET");
        return params;
    }

    function market(bytes32 id) external view returns (IMorphoBlue.Market memory) {
        require(id == marketId, "MARKET");
        return state;
    }

    function position(bytes32 id, address user) external view returns (IMorphoBlue.Position memory) {
        require(id == marketId, "MARKET");
        return positions[user];
    }

    function supply(
        IMorphoBlue.MarketParams memory,
        uint256 assets,
        uint256,
        address onBehalf,
        bytes memory
    ) external returns (uint256 assetsSupplied, uint256 sharesSupplied) {
        require(usdc.transferFrom(msg.sender, address(this), assets), "TRANSFER_FROM");
        sharesSupplied = state.totalSupplyAssets == 0 || state.totalSupplyShares == 0
            ? assets
            : (assets * state.totalSupplyShares) / state.totalSupplyAssets;
        assetsSupplied = assets;
        state.totalSupplyAssets += uint128(assets);
        state.totalSupplyShares += uint128(sharesSupplied);
        positions[onBehalf].supplyShares += sharesSupplied;
    }

    function withdraw(
        IMorphoBlue.MarketParams memory,
        uint256 assets,
        uint256,
        address onBehalf,
        address receiver
    ) external returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn) {
        require(state.totalSupplyAssets > 0 && state.totalSupplyShares > 0, "EMPTY");
        sharesWithdrawn = (assets * state.totalSupplyShares + state.totalSupplyAssets - 1) / state.totalSupplyAssets;
        require(positions[onBehalf].supplyShares >= sharesWithdrawn, "SHARES");
        positions[onBehalf].supplyShares -= sharesWithdrawn;
        state.totalSupplyAssets -= uint128(assets);
        state.totalSupplyShares -= uint128(sharesWithdrawn);
        require(usdc.transfer(receiver, assets), "TRANSFER");
        assetsWithdrawn = assets;
    }

    function addYield(uint256 assets) external {
        usdc.mint(address(this), assets);
        state.totalSupplyAssets += uint128(assets);
    }

    function setBorrowAssets(uint128 assets) external {
        state.totalBorrowAssets = assets;
    }
}

contract MorphoAllocatorTest {
    VmMorphoAllocator private constant vm =
        VmMorphoAllocator(address(uint160(uint256(keccak256("hevm cheat code")))));

    MockAllocatorUSDC private usdc;
    MockMorphoBlue private morpho;
    MorphoAllocator private allocator;

    address private constant VAULT = address(0xA110);
    address private constant CONTROLLER = address(0xC041);
    bytes32 private constant MARKET_ID = bytes32(uint256(42));

    constructor() {
        usdc = new MockAllocatorUSDC();
        morpho = new MockMorphoBlue(usdc, MARKET_ID);
        allocator = new MorphoAllocator(
            address(usdc),
            address(morpho),
            MARKET_ID,
            VAULT,
            CONTROLLER,
            1_000e6,
            1_000e6,
            1 days
        );
        _enableAllocator();
    }

    function testDepositAllocationAccountingWithdrawFlow() external {
        _fundVaultAndDeposit(100e6);

        require(allocator.totalAssets() == 100e6, "TOTAL_ASSETS");
        require(allocator.liquidAssets() == 100e6, "LIQUID_ASSETS");

        vm.prank(VAULT);
        uint256 received = allocator.withdraw(40e6);

        require(received == 40e6, "RECEIVED");
        require(usdc.balanceOf(VAULT) == 40e6, "VAULT_BALANCE");
        require(allocator.totalAssets() == 60e6, "REMAINING_ASSETS");
    }

    function testYieldAccountingIncreasesTotalAssetsBeforeWithdraw() external {
        _fundVaultAndDeposit(100e6);
        morpho.addYield(10e6);

        require(allocator.totalAssets() == 110e6, "YIELD_ACCOUNTING");

        vm.prank(VAULT);
        uint256 received = allocator.withdraw(110e6);

        require(received == 110e6, "WITHDRAW_WITH_YIELD");
        require(usdc.balanceOf(VAULT) == 110e6, "VAULT_ASSETS");
        require(allocator.totalAssets() == 0, "EMPTY");
    }

    function testEmergencyWithdrawSendsLiquidityToVault() external {
        _fundVaultAndDeposit(100e6);

        vm.prank(CONTROLLER);
        uint256 received = allocator.emergencyWithdraw(75e6);

        require(received == 75e6, "EMERGENCY_RECEIVED");
        require(usdc.balanceOf(VAULT) == 75e6, "VAULT_RECEIVED");
        require(allocator.totalAssets() == 25e6, "REMAINING");
    }

    function testDepositBlockedWhenMarketDisabled() external {
        vm.prank(CONTROLLER);
        allocator.setMarketEnabled(false);
        bool success = _callDeposit(10e6);
        require(!success, "MARKET_DISABLED_ACCEPTED");
    }

    function testDepositBlockedWhenProtocolDisabled() external {
        vm.prank(CONTROLLER);
        allocator.setProtocolEnabled(false);
        bool success = _callDeposit(10e6);
        require(!success, "PROTOCOL_DISABLED_ACCEPTED");
    }

    function testDepositBlockedWhenRiskDataIsStale() external {
        vm.warp(block.timestamp + 2 days);
        bool success = _callDeposit(10e6);
        require(!success, "STALE_ACCEPTED");
    }

    function testDepositBlockedWhenMarketExposureLimitExceeded() external {
        bool success = _callDeposit(1_001e6);
        require(!success, "EXPOSURE_ACCEPTED");
    }

    function testDepositBlockedWhenUtilizationTooHigh() external {
        morpho.setBorrowAssets(95e6);
        _fundVaultAndDeposit(100e6);

        bool success = _callDeposit(1e6);
        require(!success, "UTILIZATION_ACCEPTED");
    }

    function testOnlyVaultCanDepositOrWithdraw() external {
        usdc.mint(address(this), 10e6);
        usdc.approve(address(allocator), 10e6);
        (bool depositSuccess,) = address(allocator).call(abi.encodeCall(allocator.deposit, (10e6)));
        (bool withdrawSuccess,) = address(allocator).call(abi.encodeCall(allocator.withdraw, (1e6)));

        require(!depositSuccess, "NON_VAULT_DEPOSIT");
        require(!withdrawSuccess, "NON_VAULT_WITHDRAW");
    }

    function _enableAllocator() internal {
        vm.prank(CONTROLLER);
        allocator.setProtocolEnabled(true);
        vm.prank(CONTROLLER);
        allocator.setMarketEnabled(true);
        vm.prank(CONTROLLER);
        allocator.updateRiskData(400, 1_000);
    }

    function _fundVaultAndDeposit(uint256 assets) internal {
        usdc.mint(VAULT, assets);
        vm.prank(VAULT);
        usdc.transfer(address(allocator), assets);
        vm.prank(VAULT);
        allocator.deposit(assets);
    }

    function _callDeposit(uint256 assets) internal returns (bool success) {
        usdc.mint(VAULT, assets);
        vm.prank(VAULT);
        usdc.transfer(address(allocator), assets);
        vm.prank(VAULT);
        (success,) = address(allocator).call(abi.encodeCall(allocator.deposit, (assets)));
    }
}
