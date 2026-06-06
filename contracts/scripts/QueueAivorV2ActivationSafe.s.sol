// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface VmQueueAivorV2Activation {
    function addr(uint256 privateKey) external returns (address);
    function envAddress(string calldata key) external view returns (address);
    function envBytes32(string calldata key) external view returns (bytes32);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

interface ISafeExec {
    function getThreshold() external view returns (uint256);
    function isOwner(address owner) external view returns (bool);
    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes calldata signatures
    ) external payable returns (bool success);
}

interface IAivorControllerV2Queue {
    function queue(bytes32 operationId) external;
    function queuedAt(bytes32 operationId) external view returns (uint256);
    function hashAllocatorProtocolUpdate(address allocator, bool enabled, bytes32 salt) external pure returns (bytes32);
    function hashAllocatorMarketUpdate(address allocator, bool enabled, bytes32 salt) external pure returns (bytes32);
    function hashAllocatorRiskDataUpdate(address allocator, uint256 apyBps, uint256 riskScoreBps, bytes32 salt)
        external
        pure
        returns (bytes32);
}

contract QueueAivorV2ActivationSafe {
    VmQueueAivorV2Activation private constant vm =
        VmQueueAivorV2Activation(address(uint160(uint256(keccak256("hevm cheat code")))));

    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;
    uint256 private constant ACTIVATION_APY_BPS = 350;
    uint256 private constant ACTIVATION_RISK_SCORE_BPS = 900;

    function run() external returns (bytes32 riskOperationId, bytes32 protocolOperationId, bytes32 marketOperationId) {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        ISafeExec safe = ISafeExec(vm.envAddress("SAFE_ADDRESS"));
        IAivorControllerV2Queue controller = IAivorControllerV2Queue(vm.envAddress("AIVOR_V2_CONTROLLER_ADDRESS"));
        address allocator = vm.envAddress("AIVOR_V2_ALLOCATOR_ADDRESS");
        bytes32 salt = vm.envBytes32("AIVOR_V2_ACTIVATION_SALT");

        require(safe.getThreshold() == 1, "DEV_SAFE_THRESHOLD_ONLY");
        require(safe.isOwner(owner), "DEPLOYER_NOT_SAFE_OWNER");

        riskOperationId =
            controller.hashAllocatorRiskDataUpdate(allocator, ACTIVATION_APY_BPS, ACTIVATION_RISK_SCORE_BPS, salt);
        protocolOperationId = controller.hashAllocatorProtocolUpdate(allocator, true, salt);
        marketOperationId = controller.hashAllocatorMarketUpdate(allocator, true, salt);

        require(controller.queuedAt(riskOperationId) == 0, "RISK_ALREADY_QUEUED");
        require(controller.queuedAt(protocolOperationId) == 0, "PROTOCOL_ALREADY_QUEUED");
        require(controller.queuedAt(marketOperationId) == 0, "MARKET_ALREADY_QUEUED");

        bytes memory signatures = _prevalidatedOwnerSignature(owner);

        vm.startBroadcast(deployerPrivateKey);
        _safeQueue(safe, address(controller), riskOperationId, signatures);
        _safeQueue(safe, address(controller), protocolOperationId, signatures);
        _safeQueue(safe, address(controller), marketOperationId, signatures);
        vm.stopBroadcast();

        require(controller.queuedAt(riskOperationId) > 0, "RISK_NOT_QUEUED");
        require(controller.queuedAt(protocolOperationId) > 0, "PROTOCOL_NOT_QUEUED");
        require(controller.queuedAt(marketOperationId) > 0, "MARKET_NOT_QUEUED");
    }

    function _safeQueue(ISafeExec safe, address controller, bytes32 operationId, bytes memory signatures) private {
        bool success = safe.execTransaction(
            controller,
            0,
            abi.encodeCall(IAivorControllerV2Queue.queue, (operationId)),
            0,
            0,
            0,
            0,
            address(0),
            payable(address(0)),
            signatures
        );
        require(success, "SAFE_QUEUE_FAILED");
    }

    function _prevalidatedOwnerSignature(address owner) private pure returns (bytes memory) {
        return abi.encodePacked(bytes32(uint256(uint160(owner))), bytes32(0), uint8(1));
    }
}
