// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface VmValidateMorphoControlled {
    function envAddress(string calldata key) external view returns (address);
}

interface IAivorVaultV2ReadOnly {
    function asset() external view returns (address);
    function controller() external view returns (address);
    function idleOnlyMode() external view returns (bool);
    function morphoAllocator() external view returns (address);
    function totalAssets() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IMorphoAllocatorV2ReadOnly {
    function asset() external view returns (address);
    function controller() external view returns (address);
    function marketEnabled() external view returns (bool);
    function morpho() external view returns (address);
    function protocolEnabled() external view returns (bool);
    function totalAssets() external view returns (uint256);
    function liquidAssets() external view returns (uint256);
    function vault() external view returns (address);
}

contract ValidateMorphoControlledReadOnly {
    VmValidateMorphoControlled private constant vm =
        VmValidateMorphoControlled(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant BASE_MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;

    function run() external view returns (bool pathComplete) {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");
        address vaultAddress = vm.envAddress("AIVOR_V2_VAULT_ADDRESS");
        address controllerAddress = vm.envAddress("AIVOR_V2_CONTROLLER_ADDRESS");
        address allocatorAddress = vm.envAddress("AIVOR_V2_ALLOCATOR_ADDRESS");

        IAivorVaultV2ReadOnly vault = IAivorVaultV2ReadOnly(vaultAddress);
        IMorphoAllocatorV2ReadOnly allocator = IMorphoAllocatorV2ReadOnly(allocatorAddress);

        require(vault.asset() == BASE_MAINNET_USDC, "VAULT_ASSET");
        require(vault.controller() == controllerAddress, "VAULT_CONTROLLER");
        require(!vault.idleOnlyMode(), "VAULT_IDLE_ONLY");
        require(vault.morphoAllocator() == allocatorAddress, "VAULT_ALLOCATOR");
        require(vault.totalAssets() == 0, "VAULT_ASSETS");
        require(vault.totalSupply() == 0, "VAULT_SUPPLY");
        require(allocator.asset() == BASE_MAINNET_USDC, "ALLOCATOR_ASSET");
        require(allocator.morpho() == BASE_MORPHO_BLUE, "ALLOCATOR_MORPHO");
        require(allocator.vault() == vaultAddress, "ALLOCATOR_VAULT");
        require(allocator.controller() == controllerAddress, "ALLOCATOR_CONTROLLER");
        require(!allocator.protocolEnabled(), "PROTOCOL_ENABLED");
        require(!allocator.marketEnabled(), "MARKET_ENABLED");
        require(allocator.totalAssets() == 0, "ALLOCATOR_ASSETS");
        require(allocator.liquidAssets() == 0, "ALLOCATOR_LIQUID");
        return true;
    }
}
