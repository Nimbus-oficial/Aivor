// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/AivorControllerV2.sol";
import "../src/AivorVaultV2.sol";
import {IMorphoBlue} from "../src/MorphoAllocator.sol";
import "../src/MorphoAllocatorV2.sol";
import "../src/OrvexTreasury.sol";

interface VmAivorV2 {
    function computeCreateAddress(address deployer, uint256 nonce) external pure returns (address);
    function getNonce(address account) external view returns (uint64);
    function prank(address msgSender) external;
    function warp(uint256 newTimestamp) external;
}

contract MockV2USDC {
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

contract MockV2MorphoBlue {
    MockV2USDC public immutable usdc;
    bytes32 public immutable marketId;
    IMorphoBlue.MarketParams private params;
    IMorphoBlue.Market private state;
    mapping(address => IMorphoBlue.Position) private positions;

    constructor(MockV2USDC usdc_, bytes32 marketId_) {
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

contract AivorMorphoControlledV2Test {
    VmAivorV2 private constant vm =
        VmAivorV2(address(uint160(uint256(keccak256("hevm cheat code")))));

    MockV2USDC private usdc;
    MockV2MorphoBlue private morpho;
    AivorControllerV2 private controller;
    OrvexTreasury private treasury;
    AivorVaultV2 private vault;
    MorphoAllocatorV2 private allocator;

    address private constant VALIDATION_WALLET = address(0x2002);
    bytes32 private constant MARKET_ID = bytes32(uint256(42));
    bytes32 private constant SALT = bytes32(uint256(2026));

    constructor() {
        usdc = new MockV2USDC();
        morpho = new MockV2MorphoBlue(usdc, MARKET_ID);
        uint256 nonce = vm.getNonce(address(this));
        address predictedController = vm.computeCreateAddress(address(this), nonce);
        address predictedTreasury = vm.computeCreateAddress(address(this), nonce + 1);
        address predictedVault = vm.computeCreateAddress(address(this), nonce + 2);
        address predictedAllocator = vm.computeCreateAddress(address(this), nonce + 3);

        controller = new AivorControllerV2(address(this), 1 days);
        treasury = new OrvexTreasury(VALIDATION_WALLET);
        vault = new AivorVaultV2(
            address(usdc),
            predictedAllocator,
            predictedTreasury,
            predictedController,
            VALIDATION_WALLET,
            1e6
        );
        allocator = new MorphoAllocatorV2(
            address(usdc),
            address(morpho),
            MARKET_ID,
            predictedVault,
            predictedController,
            1e6,
            1e6,
            1 days
        );
    }

    function testV2PathIsConnectedAndDisabledByDefault() external view {
        require(!vault.idleOnlyMode(), "IDLE_ONLY");
        require(address(vault.morphoAllocator()) == address(allocator), "VAULT_ALLOCATOR");
        require(allocator.vault() == address(vault), "ALLOCATOR_VAULT");
        require(allocator.controller() == address(controller), "ALLOCATOR_CONTROLLER");
        require(!allocator.protocolEnabled(), "PROTOCOL_ENABLED");
        require(!allocator.marketEnabled(), "MARKET_ENABLED");
        require(allocator.maxMarketExposure() == 1e6, "MARKET_LIMIT");
        require(allocator.maxTotalExposure() == 1e6, "TOTAL_LIMIT");
    }

    function testControllerV2OperatesAllocatorThroughTimelock() external {
        _queueAndWarp(controller.hashAllocatorProtocolUpdate(address(allocator), true, SALT));
        controller.executeAllocatorProtocolUpdate(address(allocator), true, SALT);
        _queueAndWarp(controller.hashAllocatorMarketUpdate(address(allocator), true, SALT));
        controller.executeAllocatorMarketUpdate(address(allocator), true, SALT);
        _queueAndWarp(controller.hashAllocatorRiskDataUpdate(address(allocator), 400, 1_000, SALT));
        controller.executeAllocatorRiskDataUpdate(address(allocator), 400, 1_000, SALT);

        require(allocator.protocolEnabled(), "PROTOCOL");
        require(allocator.marketEnabled(), "MARKET");
        require(allocator.currentApyBps() == 400, "APY");
        require(allocator.riskScoreBps() == 1_000, "RISK");
        require(allocator.isHealthy(), "HEALTH");
    }

    function testActivationSimulationScenariosWithoutCapital() external {
        _queueAndWarp(controller.hashAllocatorProtocolUpdate(address(allocator), true, SALT));
        controller.executeAllocatorProtocolUpdate(address(allocator), true, SALT);
        require(allocator.protocolEnabled(), "PROTOCOL_ENABLE");

        _queueAndWarp(controller.hashAllocatorMarketUpdate(address(allocator), true, bytes32(uint256(1))));
        controller.executeAllocatorMarketUpdate(address(allocator), true, bytes32(uint256(1)));
        require(allocator.marketEnabled(), "MARKET_ENABLE");

        _queueAndWarp(controller.hashAllocatorRiskDataUpdate(address(allocator), 350, 900, bytes32(uint256(2))));
        controller.executeAllocatorRiskDataUpdate(address(allocator), 350, 900, bytes32(uint256(2)));
        require(allocator.currentApyBps() == 350, "APY_UPDATE");
        require(allocator.riskScoreBps() == 900, "RISK_UPDATE");

        _queueAndWarp(controller.hashAllocatorProtocolUpdate(address(allocator), false, bytes32(uint256(3))));
        controller.executeAllocatorProtocolUpdate(address(allocator), false, bytes32(uint256(3)));
        require(!allocator.protocolEnabled(), "PROTOCOL_DISABLE");

        _queueAndWarp(controller.hashAllocatorMarketUpdate(address(allocator), false, bytes32(uint256(4))));
        controller.executeAllocatorMarketUpdate(address(allocator), false, bytes32(uint256(4)));
        require(!allocator.marketEnabled(), "MARKET_DISABLE");

        _queueAndWarp(controller.hashAllocatorEmergencyDisable(address(allocator), bytes32(uint256(5))));
        controller.executeAllocatorEmergencyDisable(address(allocator), bytes32(uint256(5)));
        require(allocator.paused(), "EMERGENCY_PAUSE");
        require(allocator.totalAssets() == 0, "NO_CAPITAL_ASSETS");
        require(usdc.balanceOf(address(allocator)) == 0, "NO_CAPITAL_BALANCE");
    }

    function testV2DepositAllocationAccountingWithdraw() external {
        _activateAllocator();
        usdc.mint(VALIDATION_WALLET, 1e6);
        vm.prank(VALIDATION_WALLET);
        usdc.approve(address(vault), 1e6);
        vm.prank(VALIDATION_WALLET);
        uint256 shares = vault.deposit(1e6, VALIDATION_WALLET);

        require(shares == 1e6, "SHARES");
        require(vault.totalAssets() == 1e6, "VAULT_ASSETS");
        require(allocator.totalAssets() == 950_000, "ALLOCATED");
        require(usdc.balanceOf(address(vault)) == 50_000, "IDLE");

        vm.prank(VALIDATION_WALLET);
        uint256 burned = vault.withdraw(1e6, VALIDATION_WALLET, VALIDATION_WALLET);
        require(burned == 1e6, "BURNED");
        require(vault.totalAssets() == 0, "VAULT_EMPTY");
        require(allocator.totalAssets() == 0, "ALLOCATOR_EMPTY");
    }

    function testEmergencyDisableAndWithdraw() external {
        _activateAllocator();
        usdc.mint(VALIDATION_WALLET, 1e6);
        vm.prank(VALIDATION_WALLET);
        usdc.approve(address(vault), 1e6);
        vm.prank(VALIDATION_WALLET);
        vault.deposit(1e6, VALIDATION_WALLET);

        _queueAndWarp(controller.hashAllocatorEmergencyDisable(address(allocator), SALT));
        controller.executeAllocatorEmergencyDisable(address(allocator), SALT);
        require(!allocator.protocolEnabled(), "PROTOCOL_STILL_ON");
        require(!allocator.marketEnabled(), "MARKET_STILL_ON");
    }

    function testV2BlocksStaleDataAndExposureLimit() external {
        _activateAllocator();
        usdc.mint(VALIDATION_WALLET, 2e6);
        vm.prank(VALIDATION_WALLET);
        usdc.approve(address(vault), 2e6);
        vm.prank(VALIDATION_WALLET);
        (bool capSuccess,) = address(vault).call(abi.encodeCall(vault.deposit, (2e6, VALIDATION_WALLET)));
        require(!capSuccess, "CAP_ACCEPTED");

        vm.warp(block.timestamp + 2 days);
        vm.prank(VALIDATION_WALLET);
        uint256 shares = vault.deposit(1e6, VALIDATION_WALLET);
        require(shares == 1e6, "STALE_SHARES");
        require(allocator.totalAssets() == 0, "STALE_ALLOCATED");
        require(usdc.balanceOf(address(vault)) == 1e6, "STALE_NOT_IDLE");
    }

    function testYieldAndLossAccounting() external {
        _activateAllocator();
        usdc.mint(VALIDATION_WALLET, 1e6);
        vm.prank(VALIDATION_WALLET);
        usdc.approve(address(vault), 1e6);
        vm.prank(VALIDATION_WALLET);
        vault.deposit(1e6, VALIDATION_WALLET);

        morpho.addYield(50_000);
        require(vault.totalAssets() == 1_050_000, "YIELD");
        require(vault.sharePrice() == 1_050_000, "SHARE_PRICE");
    }

    function _activateAllocator() internal {
        _queueAndWarp(controller.hashAllocatorProtocolUpdate(address(allocator), true, SALT));
        controller.executeAllocatorProtocolUpdate(address(allocator), true, SALT);
        _queueAndWarp(controller.hashAllocatorMarketUpdate(address(allocator), true, SALT));
        controller.executeAllocatorMarketUpdate(address(allocator), true, SALT);
        _queueAndWarp(controller.hashAllocatorRiskDataUpdate(address(allocator), 400, 1_000, SALT));
        controller.executeAllocatorRiskDataUpdate(address(allocator), 400, 1_000, SALT);
    }

    function _queueAndWarp(bytes32 operationId) internal {
        controller.queue(operationId);
        vm.warp(block.timestamp + 1 days);
    }
}
