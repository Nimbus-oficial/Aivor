// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {OrvexController} from "./OrvexController.sol";

interface IAivorMorphoAllocatorAdmin {
    function setProtocolEnabled(bool enabled) external;
    function setMarketEnabled(bool enabled) external;
    function updateRiskData(uint256 nextApyBps, uint256 nextRiskScoreBps) external;
    function setExposureLimits(uint256 nextMaxMarketExposure, uint256 nextMaxTotalExposure) external;
    function setPaused(bool nextPaused) external;
    function emergencyWithdraw(uint256 assets) external returns (uint256);
}

contract AivorControllerV2 is OrvexController {
    event AllocatorProtocolUpdated(address indexed allocator, bool enabled);
    event AllocatorMarketUpdated(address indexed allocator, bool enabled);
    event AllocatorRiskDataUpdated(address indexed allocator, uint256 apyBps, uint256 riskScoreBps);
    event AllocatorExposureLimitsUpdated(address indexed allocator, uint256 maxMarketExposure, uint256 maxTotalExposure);
    event AllocatorEmergencyDisabled(address indexed allocator);
    event AllocatorEmergencyWithdrawn(address indexed allocator, uint256 requestedAssets, uint256 receivedAssets);

    constructor(address initialMultisig, uint256 initialTimelockDelay)
        OrvexController(initialMultisig, initialTimelockDelay)
    {}

    function executeAllocatorProtocolUpdate(address allocator, bool enabled, bytes32 salt) external onlyMultisig {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        _markExecuted(hashAllocatorProtocolUpdate(allocator, enabled, salt));
        IAivorMorphoAllocatorAdmin(allocator).setProtocolEnabled(enabled);
        emit AllocatorProtocolUpdated(allocator, enabled);
    }

    function executeAllocatorMarketUpdate(address allocator, bool enabled, bytes32 salt) external onlyMultisig {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        _markExecuted(hashAllocatorMarketUpdate(allocator, enabled, salt));
        IAivorMorphoAllocatorAdmin(allocator).setMarketEnabled(enabled);
        emit AllocatorMarketUpdated(allocator, enabled);
    }

    function executeAllocatorRiskDataUpdate(
        address allocator,
        uint256 apyBps,
        uint256 riskScoreBps,
        bytes32 salt
    ) external onlyMultisig {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        _markExecuted(hashAllocatorRiskDataUpdate(allocator, apyBps, riskScoreBps, salt));
        IAivorMorphoAllocatorAdmin(allocator).updateRiskData(apyBps, riskScoreBps);
        emit AllocatorRiskDataUpdated(allocator, apyBps, riskScoreBps);
    }

    function executeAllocatorExposureLimitsUpdate(
        address allocator,
        uint256 maxMarketExposure,
        uint256 maxTotalExposure,
        bytes32 salt
    ) external onlyMultisig {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        _markExecuted(hashAllocatorExposureLimitsUpdate(allocator, maxMarketExposure, maxTotalExposure, salt));
        IAivorMorphoAllocatorAdmin(allocator).setExposureLimits(maxMarketExposure, maxTotalExposure);
        emit AllocatorExposureLimitsUpdated(allocator, maxMarketExposure, maxTotalExposure);
    }

    function executeAllocatorEmergencyDisable(address allocator, bytes32 salt) external onlyMultisig {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        _markExecuted(hashAllocatorEmergencyDisable(allocator, salt));
        IAivorMorphoAllocatorAdmin(allocator).setMarketEnabled(false);
        IAivorMorphoAllocatorAdmin(allocator).setProtocolEnabled(false);
        IAivorMorphoAllocatorAdmin(allocator).setPaused(true);
        emit AllocatorEmergencyDisabled(allocator);
    }

    function executeAllocatorEmergencyWithdraw(address allocator, uint256 assets, bytes32 salt)
        external
        onlyMultisig
        returns (uint256 received)
    {
        require(allocator != address(0), "ALLOCATOR_ZERO");
        require(assets > 0, "ZERO_ASSETS");
        _markExecuted(hashAllocatorEmergencyWithdraw(allocator, assets, salt));
        received = IAivorMorphoAllocatorAdmin(allocator).emergencyWithdraw(assets);
        emit AllocatorEmergencyWithdrawn(allocator, assets, received);
    }

    function hashAllocatorProtocolUpdate(address allocator, bool enabled, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("ALLOCATOR_PROTOCOL", allocator, enabled, salt));
    }

    function hashAllocatorMarketUpdate(address allocator, bool enabled, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("ALLOCATOR_MARKET", allocator, enabled, salt));
    }

    function hashAllocatorRiskDataUpdate(address allocator, uint256 apyBps, uint256 riskScoreBps, bytes32 salt)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode("ALLOCATOR_RISK_DATA", allocator, apyBps, riskScoreBps, salt));
    }

    function hashAllocatorExposureLimitsUpdate(
        address allocator,
        uint256 maxMarketExposure,
        uint256 maxTotalExposure,
        bytes32 salt
    ) public pure returns (bytes32) {
        return keccak256(abi.encode("ALLOCATOR_EXPOSURE_LIMITS", allocator, maxMarketExposure, maxTotalExposure, salt));
    }

    function hashAllocatorEmergencyDisable(address allocator, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("ALLOCATOR_EMERGENCY_DISABLE", allocator, salt));
    }

    function hashAllocatorEmergencyWithdraw(address allocator, uint256 assets, bytes32 salt) public pure returns (bytes32) {
        return keccak256(abi.encode("ALLOCATOR_EMERGENCY_WITHDRAW", allocator, assets, salt));
    }
}
