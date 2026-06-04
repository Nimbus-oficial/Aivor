// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IOrvexVaultAdmin {
    function setPaused(bool nextPaused) external;
    function setStrategiesPaused(bool nextPaused) external;
    function setEmergencyShutdown(bool enabled) external;
    function setIdleLiquidityBps(uint256 nextIdleLiquidityBps) external;
    function emergencyWithdrawFromAllocator(uint256 assets) external returns (uint256);
}

contract OrvexController {
    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant MIN_IDLE_LIQUIDITY_BPS = 200;
    uint256 public constant MAX_IDLE_LIQUIDITY_BPS = 700;

    address public immutable multisig;
    uint256 public immutable timelockDelay;

    struct StrategyConfig {
        uint256 targetBps;
        bool active;
    }

    mapping(bytes32 => uint256) public queuedAt;
    mapping(bytes32 => bool) public executed;
    mapping(bytes32 => StrategyConfig) public strategyConfigs;

    uint256 public totalActiveStrategyBps;

    event OperationQueued(bytes32 indexed operationId);
    event OperationExecuted(bytes32 indexed operationId);
    event StrategyConfigUpdated(bytes32 indexed marketId, uint256 targetBps, bool active);
    event EmergencyPause(address indexed vault);

    modifier onlyMultisig() {
        require(msg.sender == multisig, "ONLY_MULTISIG");
        _;
    }

    constructor(address initialMultisig, uint256 initialTimelockDelay) {
        require(initialMultisig != address(0), "MULTISIG_ZERO");
        require(initialTimelockDelay >= 1 days, "TIMELOCK_TOO_SHORT");
        multisig = initialMultisig;
        timelockDelay = initialTimelockDelay;
    }

    function queue(bytes32 operationId) external onlyMultisig {
        require(operationId != bytes32(0), "OPERATION_ZERO");
        require(queuedAt[operationId] == 0, "ALREADY_QUEUED");
        require(!executed[operationId], "ALREADY_EXECUTED");
        queuedAt[operationId] = block.timestamp;
        emit OperationQueued(operationId);
    }

    function markExecuted(bytes32 operationId) public onlyMultisig {
        _markExecuted(operationId);
    }

    function emergencyPause(address vault) external onlyMultisig {
        require(vault != address(0), "VAULT_ZERO");
        IOrvexVaultAdmin(vault).setPaused(true);
        IOrvexVaultAdmin(vault).setStrategiesPaused(true);
        emit EmergencyPause(vault);
    }

    function executeVaultPause(address vault, bool nextPaused, bytes32 salt) external onlyMultisig {
        require(vault != address(0), "VAULT_ZERO");
        _markExecuted(hashVaultPause(vault, nextPaused, salt));
        IOrvexVaultAdmin(vault).setPaused(nextPaused);
    }

    function executeStrategiesPause(address vault, bool nextPaused, bytes32 salt) external onlyMultisig {
        require(vault != address(0), "VAULT_ZERO");
        _markExecuted(hashStrategiesPause(vault, nextPaused, salt));
        IOrvexVaultAdmin(vault).setStrategiesPaused(nextPaused);
    }

    function executeEmergencyShutdown(address vault, bool enabled, bytes32 salt) external onlyMultisig {
        require(vault != address(0), "VAULT_ZERO");
        _markExecuted(hashEmergencyShutdown(vault, enabled, salt));
        IOrvexVaultAdmin(vault).setEmergencyShutdown(enabled);
    }

    function executeIdleLiquidityUpdate(address vault, uint256 idleLiquidityBps, bytes32 salt) external onlyMultisig {
        require(vault != address(0), "VAULT_ZERO");
        require(idleLiquidityBps >= MIN_IDLE_LIQUIDITY_BPS, "IDLE_TOO_LOW");
        require(idleLiquidityBps <= MAX_IDLE_LIQUIDITY_BPS, "IDLE_TOO_HIGH");
        _markExecuted(hashIdleLiquidityUpdate(vault, idleLiquidityBps, salt));
        IOrvexVaultAdmin(vault).setIdleLiquidityBps(idleLiquidityBps);
    }

    function executeEmergencyWithdraw(address vault, uint256 assets, bytes32 salt) external onlyMultisig returns (uint256) {
        require(vault != address(0), "VAULT_ZERO");
        require(assets > 0, "ZERO_ASSETS");
        _markExecuted(hashEmergencyWithdraw(vault, assets, salt));
        return IOrvexVaultAdmin(vault).emergencyWithdrawFromAllocator(assets);
    }

    function executeStrategyConfig(bytes32 marketId, uint256 targetBps, bool active, bytes32 salt) external onlyMultisig {
        require(marketId != bytes32(0), "MARKET_ZERO");
        require(targetBps <= BASIS_POINTS, "TARGET_INVALID");
        _markExecuted(hashStrategyConfig(marketId, targetBps, active, salt));

        StrategyConfig memory current = strategyConfigs[marketId];
        uint256 nextTotal = totalActiveStrategyBps;
        if (current.active) nextTotal -= current.targetBps;
        if (active) nextTotal += targetBps;
        require(nextTotal <= BASIS_POINTS, "ALLOCATION_TOO_HIGH");

        strategyConfigs[marketId] = StrategyConfig({ targetBps: targetBps, active: active });
        totalActiveStrategyBps = nextTotal;

        emit StrategyConfigUpdated(marketId, targetBps, active);
    }

    function hashVaultPause(address vault, bool nextPaused, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("VAULT_PAUSE", vault, nextPaused, salt));
    }

    function hashStrategiesPause(address vault, bool nextPaused, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("STRATEGIES_PAUSE", vault, nextPaused, salt));
    }

    function hashEmergencyShutdown(address vault, bool enabled, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("EMERGENCY_SHUTDOWN", vault, enabled, salt));
    }

    function hashIdleLiquidityUpdate(address vault, uint256 idleLiquidityBps, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("IDLE_LIQUIDITY", vault, idleLiquidityBps, salt));
    }

    function hashEmergencyWithdraw(address vault, uint256 assets, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("EMERGENCY_WITHDRAW", vault, assets, salt));
    }

    function hashStrategyConfig(bytes32 marketId, uint256 targetBps, bool active, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("STRATEGY_CONFIG", marketId, targetBps, active, salt));
    }

    function _markExecuted(bytes32 operationId) internal {
        uint256 queued = queuedAt[operationId];
        require(queued != 0, "NOT_QUEUED");
        require(block.timestamp >= queued + timelockDelay, "TIMELOCK_PENDING");
        delete queuedAt[operationId];
        executed[operationId] = true;
        emit OperationExecuted(operationId);
    }
}
