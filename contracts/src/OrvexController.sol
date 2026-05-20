// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract OrvexController {
    address public immutable multisig;
    uint256 public immutable timelockDelay;

    mapping(bytes32 => uint256) public queuedAt;

    event OperationQueued(bytes32 indexed operationId);
    event OperationExecuted(bytes32 indexed operationId);

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
        require(queuedAt[operationId] == 0, "ALREADY_QUEUED");
        queuedAt[operationId] = block.timestamp;
        emit OperationQueued(operationId);
    }

    function markExecuted(bytes32 operationId) external onlyMultisig {
        uint256 queued = queuedAt[operationId];
        require(queued != 0, "NOT_QUEUED");
        require(block.timestamp >= queued + timelockDelay, "TIMELOCK_PENDING");
        delete queuedAt[operationId];
        emit OperationExecuted(operationId);
    }
}
