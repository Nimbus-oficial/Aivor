// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/OrvexController.sol";
import "../src/OrvexTreasury.sol";
import "../src/OrvexVault.sol";

interface Vm {
    function envAddress(string calldata key) external view returns (address);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployPrivateMainnetValidation {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;

    function run() external returns (OrvexVault vault, OrvexController controller, OrvexTreasury treasury) {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address validationController = vm.envAddress("SAFE_ADDRESS");
        address treasuryWallet = vm.envAddress("TREASURY_WALLET");
        address validationWallet = vm.envAddress("VALIDATION_WALLET");
        uint256 validationDepositCap = vm.envUint("VALIDATION_DEPOSIT_CAP");

        require(usdc == BASE_MAINNET_USDC, "USDC_BASE_MAINNET_ONLY");
        require(validationDepositCap > 0, "VALIDATION_CAP_ZERO");

        vm.startBroadcast(deployerPrivateKey);

        controller = new OrvexController(validationController, 2 days);
        treasury = new OrvexTreasury(treasuryWallet);
        vault = new OrvexVault(
            usdc,
            address(0),
            address(treasury),
            address(controller),
            true,
            validationWallet,
            validationDepositCap
        );

        vm.stopBroadcast();
    }
}
