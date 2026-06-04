// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/OrvexController.sol";
import "../src/OrvexVault.sol";

interface Vm {
    function warp(uint256 newTimestamp) external;
}

contract MockUSDC {
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

contract MockMorphoAllocator {
    MockUSDC public immutable usdc;
    uint256 public managedAssets;

    constructor(MockUSDC usdc_) {
        usdc = usdc_;
    }

    function deposit(uint256 assets) external {
        managedAssets += assets;
    }

    function withdraw(uint256 assets) external returns (uint256) {
        uint256 available = assets <= managedAssets ? assets : managedAssets;
        managedAssets -= available;
        require(usdc.transfer(msg.sender, available), "TRANSFER_FAILED");
        return available;
    }

    function totalAssets() external view returns (uint256) {
        return managedAssets;
    }

    function addYield(uint256 assets) external {
        usdc.mint(address(this), assets);
        managedAssets += assets;
    }
}

contract ExternalCaller {
    function callEmergencyPause(OrvexController controller, address vault) external returns (bool success) {
        (success,) = address(controller).call(abi.encodeCall(controller.emergencyPause, (vault)));
    }

    function callDeposit(OrvexVault vault, uint256 assets, address receiver) external returns (bool success) {
        (success,) = address(vault).call(abi.encodeCall(vault.deposit, (assets, receiver)));
    }
}

contract OrvexVaultTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    MockUSDC private usdc;
    MockMorphoAllocator private allocator;
    OrvexController private controller;
    OrvexVault private vault;

    address private constant TREASURY = address(0x1001);
    bytes32 private constant SALT = bytes32(uint256(123));

    constructor() {
        usdc = new MockUSDC();
        allocator = new MockMorphoAllocator(usdc);
        controller = new OrvexController(address(this), 1 days);
        vault = new OrvexVault(address(usdc), address(allocator), TREASURY, address(controller));
    }

    function testMetadataUsesYieldBearingShareToken() external view {
        require(keccak256(bytes(vault.name())) == keccak256(bytes("Orvex Yield USDC")), "NAME");
        require(keccak256(bytes(vault.symbol())) == keccak256(bytes("ovUSDC")), "SYMBOL");
        require(vault.decimals() == 6, "DECIMALS");
        require(vault.asset() == address(usdc), "ASSET");
    }

    function testDepositKeepsFivePercentLiquid() external {
        _deposit(address(this), 1_000e6);

        require(vault.balanceOf(address(this)) == 1_000e6, "SHARES");
        require(usdc.balanceOf(address(vault)) == 50e6, "LIQUID");
        require(allocator.managedAssets() == 950e6, "ALLOCATED");
    }

    function testMultipleDepositsKeepShareAccounting() external {
        _deposit(address(this), 1_000e6);
        allocator.addYield(100e6);

        uint256 secondDepositShares = _deposit(address(this), 550e6);

        require(secondDepositShares == 500e6, "SECOND_SHARES");
        require(vault.totalSupply() == 1_500e6, "TOTAL_SUPPLY");
        require(vault.convertToAssets(vault.balanceOf(address(this))) == 1_650e6, "TOTAL_VALUE");
        require(usdc.balanceOf(address(vault)) == 82_500_000, "TARGET_LIQUID");
    }

    function testWithdrawBurnsSharesAndReturnsAssets() external {
        _deposit(address(this), 1_000e6);
        allocator.addYield(100e6);

        uint256 sharesBurned = vault.withdraw(110e6, address(this), address(this));

        require(sharesBurned == 100e6, "SHARES_BURNED");
        require(vault.balanceOf(address(this)) == 900e6, "REMAINING_SHARES");
        require(usdc.balanceOf(address(this)) == 110e6, "USER_ASSETS");
    }

    function testMultipleRedeemsBurnSharesAtCurrentSharePrice() external {
        _deposit(address(this), 1_000e6);
        allocator.addYield(100e6);

        uint256 firstAssets = vault.redeem(100e6, address(this), address(this));
        uint256 secondAssets = vault.redeem(100e6, address(this), address(this));

        require(firstAssets == 110e6, "FIRST_ASSETS");
        require(secondAssets == 110e6, "SECOND_ASSETS");
        require(vault.balanceOf(address(this)) == 800e6, "REMAINING_SHARES");
    }

    function testRoundingUsesCeilForWithdrawPreview() external {
        _deposit(address(this), 3);
        allocator.addYield(1);

        require(vault.previewWithdraw(2) == 2, "ROUND_UP");
        require(vault.previewRedeem(1) == 1, "ROUND_DOWN");
    }

    function testLiquidityLimitsCanOnlyUseOfficialRange() external {
        bool lowRejected = _callSetIdleLiquidity(199);
        bool minAccepted = _callSetIdleLiquidity(200);
        bool targetAccepted = _callSetIdleLiquidity(500);
        bool maxAccepted = _callSetIdleLiquidity(700);
        bool highRejected = _callSetIdleLiquidity(701);

        require(!lowRejected, "LOW_ACCEPTED");
        require(minAccepted, "MIN_REJECTED");
        require(targetAccepted, "TARGET_REJECTED");
        require(maxAccepted, "MAX_REJECTED");
        require(!highRejected, "HIGH_ACCEPTED");
        require(vault.idleLiquidityBps() == 700, "FINAL_BPS");
    }

    function testEmergencyPauseBlocksDepositsButKeepsWithdrawalsAvailable() external {
        _deposit(address(this), 1_000e6);
        controller.emergencyPause(address(vault));

        bool depositAccepted = _callDeposit(1e6);
        uint256 sharesBurned = vault.withdraw(100e6, address(this), address(this));

        require(!depositAccepted, "DEPOSIT_ACCEPTED");
        require(sharesBurned > 0, "WITHDRAW");
        require(usdc.balanceOf(address(this)) == 101e6, "USER_LIQUIDITY");
    }

    function testOnlyControllerCanPauseVault() external {
        (bool success,) = address(vault).call(abi.encodeCall(vault.setPaused, (true)));
        require(!success, "NON_CONTROLLER_PAUSED");
    }

    function testOnlyMultisigCanUseController() external {
        ExternalCaller caller = new ExternalCaller();
        bool success = caller.callEmergencyPause(controller, address(vault));
        require(!success, "NON_MULTISIG_PAUSED");
    }

    function testTimelockRequiredForCriticalChanges() external {
        bytes32 operationId = controller.hashIdleLiquidityUpdate(address(vault), 700, SALT);
        controller.queue(operationId);

        (bool earlySuccess,) = address(controller).call(
            abi.encodeCall(controller.executeIdleLiquidityUpdate, (address(vault), 700, SALT))
        );
        require(!earlySuccess, "TIMELOCK_BYPASSED");

        vm.warp(block.timestamp + 1 days);
        controller.executeIdleLiquidityUpdate(address(vault), 700, SALT);

        require(vault.idleLiquidityBps() == 700, "IDLE_NOT_UPDATED");
        require(controller.executed(operationId), "NOT_MARKED_EXECUTED");
    }

    function testExecutedOperationCannotBeReplayed() external {
        bytes32 operationId = controller.hashStrategiesPause(address(vault), true, SALT);
        controller.queue(operationId);
        vm.warp(block.timestamp + 1 days);
        controller.executeStrategiesPause(address(vault), true, SALT);

        (bool replaySuccess,) = address(controller).call(
            abi.encodeCall(controller.executeStrategiesPause, (address(vault), true, SALT))
        );
        (bool requeueSuccess,) = address(controller).call(abi.encodeCall(controller.queue, (operationId)));

        require(!replaySuccess, "REPLAY_EXECUTED");
        require(!requeueSuccess, "REQUEUE_EXECUTED");
    }

    function testPerformanceFeeAppliesOnlyToYield() external {
        _deposit(address(this), 1_000e6);

        allocator.addYield(100e6);
        uint256 fee = vault.harvestPerformanceFee();

        require(fee == 15e6, "FEE");
        require(usdc.balanceOf(TREASURY) == 15e6, "TREASURY");
    }

    function testPerformanceFeeCannotRunWhenStrategiesPaused() external {
        _deposit(address(this), 1_000e6);
        allocator.addYield(100e6);
        controller.emergencyPause(address(vault));

        (bool success,) = address(vault).call(abi.encodeCall(vault.harvestPerformanceFee, ()));
        require(!success, "FEE_WHILE_PAUSED");
    }

    function testYieldIncreasesSharePriceWithoutRebasing() external {
        _deposit(address(this), 1_000e6);
        uint256 sharesBeforeYield = vault.balanceOf(address(this));
        require(sharesBeforeYield == 1_000e6, "INITIAL_SHARES");
        require(vault.sharePrice() == 1e6, "INITIAL_SHARE_PRICE");

        allocator.addYield(100e6);

        require(vault.balanceOf(address(this)) == sharesBeforeYield, "REBASING_SHARES");
        require(vault.sharePrice() == 1_100_000, "YIELD_SHARE_PRICE");
        require(vault.convertToAssets(sharesBeforeYield) == 1_100e6, "ASSET_VALUE");
    }

    function testWithdrawFailsWhenAllocatorCannotProvideLiquidity() external {
        _deposit(address(this), 1_000e6);
        allocator.withdraw(950e6);

        (bool success,) = address(vault).call(abi.encodeCall(vault.withdraw, (100e6, address(this), address(this))));
        require(!success, "INSOLVENT_WITHDRAW");
    }

    function testStrategyAllocationCannotExceedOneHundredPercent() external {
        bytes32 firstMarket = bytes32(uint256(1));
        bytes32 secondMarket = bytes32(uint256(2));
        bytes32 firstSalt = bytes32(uint256(11));
        bytes32 secondSalt = bytes32(uint256(12));

        bytes32 firstOperation = controller.hashStrategyConfig(firstMarket, 7_000, true, firstSalt);
        bytes32 secondOperation = controller.hashStrategyConfig(secondMarket, 4_000, true, secondSalt);
        controller.queue(firstOperation);
        controller.queue(secondOperation);
        vm.warp(block.timestamp + 1 days);
        controller.executeStrategyConfig(firstMarket, 7_000, true, firstSalt);

        (bool success,) = address(controller).call(
            abi.encodeCall(controller.executeStrategyConfig, (secondMarket, 4_000, true, secondSalt))
        );
        require(!success, "OVER_ALLOCATED");
    }

    function _deposit(address receiver, uint256 assets) internal returns (uint256 shares) {
        usdc.mint(address(this), assets);
        usdc.approve(address(vault), assets);
        shares = vault.deposit(assets, receiver);
    }

    function _callSetIdleLiquidity(uint256 bps) internal returns (bool success) {
        bytes32 salt = bytes32(bps);
        bytes32 operationId = controller.hashIdleLiquidityUpdate(address(vault), bps, salt);
        controller.queue(operationId);
        vm.warp(block.timestamp + 1 days);
        (success,) = address(controller).call(
            abi.encodeCall(controller.executeIdleLiquidityUpdate, (address(vault), bps, salt))
        );
    }

    function _callDeposit(uint256 assets) internal returns (bool success) {
        usdc.mint(address(this), assets);
        usdc.approve(address(vault), assets);
        (success,) = address(vault).call(abi.encodeCall(vault.deposit, (assets, address(this))));
    }
}
