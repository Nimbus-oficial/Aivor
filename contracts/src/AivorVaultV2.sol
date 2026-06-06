// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {OrvexVault} from "./OrvexVault.sol";

contract AivorVaultV2 is OrvexVault {
    constructor(
        address asset_,
        address morphoAllocator_,
        address treasury_,
        address controller_,
        address validationWallet_,
        uint256 validationDepositCap_
    )
        OrvexVault(
            asset_,
            morphoAllocator_,
            treasury_,
            controller_,
            false,
            validationWallet_,
            validationDepositCap_
        )
    {}
}
