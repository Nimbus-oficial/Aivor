// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/OrvexController.sol";
import "../src/OrvexTreasury.sol";
import "../src/OrvexVault.sol";

contract DeployOrvex {
    function deploy(
        address usdc,
        address morphoAllocator,
        address multisig,
        address treasuryWallet
    ) external returns (OrvexVault vault, OrvexController controller, OrvexTreasury treasury) {
        controller = new OrvexController(multisig, 2 days);
        treasury = new OrvexTreasury(treasuryWallet);
        vault = new OrvexVault(usdc, morphoAllocator, address(treasury), address(controller));
    }
}
