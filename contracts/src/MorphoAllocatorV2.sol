// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MorphoAllocator} from "./MorphoAllocator.sol";

contract MorphoAllocatorV2 is MorphoAllocator {
    constructor(
        address asset_,
        address morpho_,
        bytes32 marketId_,
        address vault_,
        address controller_,
        uint256 maxMarketExposure_,
        uint256 maxTotalExposure_,
        uint256 maxMarketDataAge_
    )
        MorphoAllocator(
            asset_,
            morpho_,
            marketId_,
            vault_,
            controller_,
            maxMarketExposure_,
            maxTotalExposure_,
            maxMarketDataAge_
        )
    {}
}
