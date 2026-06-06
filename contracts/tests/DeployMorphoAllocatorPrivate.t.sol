// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../scripts/DeployMorphoAllocatorPrivate.s.sol";

interface VmDeployAllocatorTest {
    function createSelectFork(string calldata url) external returns (uint256 forkId);
    function setEnv(string calldata key, string calldata value) external;
}

contract DeployMorphoAllocatorPrivateTest {
    VmDeployAllocatorTest private constant vm =
        VmDeployAllocatorTest(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant BASE_MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    address private constant VAULT = 0x0Ad107434e35b91a72a98663696Fc73BAA19dc1E;
    address private constant CONTROLLER = 0x6B1eC9fbdD4d935B569ea4732d15F1126a7e444b;
    address private constant SAFE = 0xd5e3a1507bbf473D750692848886E7Bb6E753FAb;
    bytes32 private constant MARKET_ID = 0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836;

    function testDeployScriptCreatesDisabledAllocatorOnBaseFork() external {
        vm.createSelectFork("https://mainnet.base.org");
        _setDeployEnv();

        MorphoAllocator allocator = new DeployMorphoAllocatorPrivate().run();

        require(address(allocator.asset()) == BASE_USDC, "ASSET");
        require(address(allocator.morpho()) == BASE_MORPHO_BLUE, "MORPHO");
        require(allocator.vault() == VAULT, "VAULT");
        require(allocator.controller() == CONTROLLER, "CONTROLLER");
        require(allocator.marketId() == MARKET_ID, "MARKET");
        require(!allocator.protocolEnabled(), "PROTOCOL_ENABLED");
        require(!allocator.marketEnabled(), "MARKET_ENABLED");
        require(!allocator.isHealthy(), "HEALTHY");
        require(allocator.totalAssets() == 0, "TOTAL_ASSETS");
        require(allocator.liquidAssets() == 0, "LIQUID_ASSETS");
    }

    function _setDeployEnv() internal {
        vm.setEnv("DEPLOYER_PRIVATE_KEY", "1");
        vm.setEnv("ORVEX_VAULT_ADDRESS", "0x0Ad107434e35b91a72a98663696Fc73BAA19dc1E");
        vm.setEnv("ORVEX_CONTROLLER_ADDRESS", "0x6B1eC9fbdD4d935B569ea4732d15F1126a7e444b");
        vm.setEnv("SAFE_ADDRESS", "0xd5e3a1507bbf473D750692848886E7Bb6E753FAb");
        vm.setEnv("USDC_ADDRESS", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
        vm.setEnv("MORPHO_BLUE_ADDRESS", "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb");
        vm.setEnv(
            "MORPHO_MARKET_ID",
            "0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836"
        );
        vm.setEnv("MORPHO_ALLOCATOR_MAX_MARKET_EXPOSURE", "1000000");
        vm.setEnv("MORPHO_ALLOCATOR_MAX_TOTAL_EXPOSURE", "1000000");
        vm.setEnv("MORPHO_ALLOCATOR_MAX_MARKET_DATA_AGE", "300");
    }
}
