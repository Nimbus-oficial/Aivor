// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface VmValidateMorphoAllocator {
    function envAddress(string calldata key) external view returns (address);
    function envBytes32(string calldata key) external view returns (bytes32);
}

interface IMorphoAllocatorReadOnly {
    function asset() external view returns (address);
    function morpho() external view returns (address);
    function vault() external view returns (address);
    function controller() external view returns (address);
    function marketId() external view returns (bytes32);
    function protocolEnabled() external view returns (bool);
    function marketEnabled() external view returns (bool);
    function maxMarketExposure() external view returns (uint256);
    function maxTotalExposure() external view returns (uint256);
    function maxMarketDataAge() external view returns (uint256);
    function marketDataUpdatedAt() external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function liquidAssets() external view returns (uint256);
    function isHealthy() external view returns (bool);
}

contract ValidateMorphoAllocatorReadOnly {
    VmValidateMorphoAllocator private constant vm =
        VmValidateMorphoAllocator(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant BASE_MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;

    function run()
        external
        view
        returns (
            address allocatorAddress,
            address vault,
            address controller,
            bytes32 marketId,
            uint256 maxMarketExposure,
            uint256 maxTotalExposure,
            bool protocolEnabled,
            bool marketEnabled,
            bool healthy
        )
    {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        allocatorAddress = vm.envAddress("MORPHO_ALLOCATOR_ADDRESS");
        address expectedVault = vm.envAddress("ORVEX_VAULT_ADDRESS");
        address expectedController = vm.envAddress("ORVEX_CONTROLLER_ADDRESS");
        bytes32 expectedMarketId = vm.envBytes32("MORPHO_MARKET_ID");

        IMorphoAllocatorReadOnly allocator = IMorphoAllocatorReadOnly(allocatorAddress);

        vault = allocator.vault();
        controller = allocator.controller();
        marketId = allocator.marketId();
        maxMarketExposure = allocator.maxMarketExposure();
        maxTotalExposure = allocator.maxTotalExposure();
        protocolEnabled = allocator.protocolEnabled();
        marketEnabled = allocator.marketEnabled();
        healthy = allocator.isHealthy();

        require(allocator.asset() == BASE_MAINNET_USDC, "ASSET_MISMATCH");
        require(allocator.morpho() == BASE_MORPHO_BLUE, "MORPHO_MISMATCH");
        require(vault == expectedVault, "VAULT_MISMATCH");
        require(controller == expectedController, "CONTROLLER_MISMATCH");
        require(marketId == expectedMarketId, "MARKET_MISMATCH");
        require(!protocolEnabled, "PROTOCOL_ENABLED");
        require(!marketEnabled, "MARKET_ENABLED");
        require(!healthy, "ALLOCATOR_HEALTHY");
        require(allocator.marketDataUpdatedAt() == 0, "RISK_DATA_ALREADY_SET");
        require(allocator.maxMarketDataAge() > 0, "STALE_LIMIT_ZERO");
        require(allocator.totalAssets() == 0, "TOTAL_ASSETS_NOT_ZERO");
        require(allocator.liquidAssets() == 0, "LIQUID_ASSETS_NOT_ZERO");
    }
}
