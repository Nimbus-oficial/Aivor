// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/OrvexController.sol";
import "../src/OrvexTreasury.sol";
import "../src/OrvexVault.sol";
import "../src/mocks/MockMorphoAllocator.sol";
import "../src/mocks/MockUSDC.sol";

interface Vm {
    function envAddress(string calldata key) external view returns (address);
    function envOr(string calldata key, address defaultValue) external view returns (address);
    function envOr(string calldata key, bool defaultValue) external view returns (bool);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployTestnet {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run()
        external
        returns (
            OrvexVault vault,
            OrvexController controller,
            OrvexTreasury treasury,
            address usdc,
            address morphoAllocator
        )
    {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        bool deployMocks = vm.envOr("DEPLOY_TESTNET_MOCKS", true);
        address safe = vm.envAddress("SAFE_ADDRESS");
        address treasuryWallet = vm.envAddress("TREASURY_WALLET");

        if (!deployMocks) {
            usdc = vm.envAddress("USDC_ADDRESS");
            morphoAllocator = vm.envAddress("MORPHO_ALLOCATOR_ADDRESS");
        }

        vm.startBroadcast(deployerPrivateKey);

        if (deployMocks) {
            MockUSDC mockUsdc = new MockUSDC();
            MockMorphoAllocator mockAllocator = new MockMorphoAllocator(address(mockUsdc));
            usdc = address(mockUsdc);
            morphoAllocator = address(mockAllocator);
        }

        require(usdc != address(0), "USDC_NOT_SET");
        require(morphoAllocator != address(0), "ALLOCATOR_NOT_SET");

        controller = new OrvexController(safe, 2 days);
        treasury = new OrvexTreasury(treasuryWallet);
        vault = new OrvexVault(usdc, morphoAllocator, address(treasury), address(controller), false, address(0), 0);

        vm.stopBroadcast();
    }
}
