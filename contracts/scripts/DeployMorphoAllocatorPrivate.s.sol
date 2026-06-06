// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/MorphoAllocator.sol";

interface VmDeployMorphoAllocator {
    function envAddress(string calldata key) external view returns (address);
    function envBytes32(string calldata key) external view returns (bytes32);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

interface IAllocatorVaultReadOnly {
    function asset() external view returns (address);
}

interface IAllocatorControllerReadOnly {
    function multisig() external view returns (address);
}

contract DeployMorphoAllocatorPrivate {
    VmDeployMorphoAllocator private constant vm =
        VmDeployMorphoAllocator(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant BASE_MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;

    function run() external returns (MorphoAllocator allocator) {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address vault = vm.envAddress("ORVEX_VAULT_ADDRESS");
        address controller = vm.envAddress("ORVEX_CONTROLLER_ADDRESS");
        address safe = vm.envAddress("SAFE_ADDRESS");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address morpho = vm.envAddress("MORPHO_BLUE_ADDRESS");
        bytes32 marketId = vm.envBytes32("MORPHO_MARKET_ID");
        uint256 maxMarketExposure = vm.envUint("MORPHO_ALLOCATOR_MAX_MARKET_EXPOSURE");
        uint256 maxTotalExposure = vm.envUint("MORPHO_ALLOCATOR_MAX_TOTAL_EXPOSURE");
        uint256 maxMarketDataAge = vm.envUint("MORPHO_ALLOCATOR_MAX_MARKET_DATA_AGE");

        require(vault != address(0), "VAULT_ZERO");
        require(controller != address(0), "CONTROLLER_ZERO");
        require(safe != address(0), "SAFE_ZERO");
        require(usdc == BASE_MAINNET_USDC, "USDC_BASE_MAINNET_ONLY");
        require(morpho == BASE_MORPHO_BLUE, "MORPHO_BLUE_BASE_ONLY");
        require(marketId != bytes32(0), "MARKET_ZERO");
        require(IAllocatorVaultReadOnly(vault).asset() == BASE_MAINNET_USDC, "VAULT_ASSET_MISMATCH");
        require(IAllocatorControllerReadOnly(controller).multisig() == safe, "SAFE_NOT_CONTROLLER_MULTISIG");
        require(maxMarketExposure > 0, "MARKET_EXPOSURE_ZERO");
        require(maxTotalExposure > 0, "TOTAL_EXPOSURE_ZERO");
        require(maxMarketExposure <= maxTotalExposure, "MARKET_GT_TOTAL");
        require(maxMarketDataAge > 0, "STALE_LIMIT_ZERO");

        IMorphoBlue.MarketParams memory params = IMorphoBlue(morpho).idToMarketParams(marketId);
        require(params.loanToken == BASE_MAINNET_USDC, "MARKET_NOT_USDC");

        vm.startBroadcast(deployerPrivateKey);
        allocator = new MorphoAllocator(
            usdc,
            morpho,
            marketId,
            vault,
            controller,
            maxMarketExposure,
            maxTotalExposure,
            maxMarketDataAge
        );
        vm.stopBroadcast();

        require(address(allocator.asset()) == BASE_MAINNET_USDC, "ALLOCATOR_ASSET");
        require(address(allocator.morpho()) == BASE_MORPHO_BLUE, "ALLOCATOR_MORPHO");
        require(allocator.vault() == vault, "ALLOCATOR_VAULT");
        require(allocator.controller() == controller, "ALLOCATOR_CONTROLLER");
        require(!allocator.protocolEnabled(), "PROTOCOL_SHOULD_BE_DISABLED");
        require(!allocator.marketEnabled(), "MARKET_SHOULD_BE_DISABLED");
        require(allocator.totalAssets() == 0, "ALLOCATOR_HAS_ASSETS");
    }
}
