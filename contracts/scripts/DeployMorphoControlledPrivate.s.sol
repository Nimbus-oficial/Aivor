// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/AivorControllerV2.sol";
import "../src/AivorVaultV2.sol";
import "../src/MorphoAllocatorV2.sol";
import "../src/OrvexTreasury.sol";

interface VmDeployMorphoControlled {
    function addr(uint256 privateKey) external returns (address);
    function computeCreateAddress(address deployer, uint256 nonce) external pure returns (address);
    function envAddress(string calldata key) external view returns (address);
    function envBytes32(string calldata key) external view returns (bytes32);
    function envUint(string calldata key) external view returns (uint256);
    function getNonce(address account) external view returns (uint64);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployMorphoControlledPrivate {
    VmDeployMorphoControlled private constant vm =
        VmDeployMorphoControlled(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant BASE_MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;
    uint256 private constant INITIAL_EXPOSURE_LIMIT = 1e6;

    struct DeployConfig {
        uint256 deployerPrivateKey;
        address deployer;
        address usdc;
        address safe;
        address treasuryWallet;
        address validationWallet;
        address morpho;
        bytes32 marketId;
        uint256 validationDepositCap;
        uint256 maxMarketDataAge;
    }

    struct PredictedAddresses {
        address controller;
        address treasury;
        address vault;
        address allocator;
    }

    function run()
        external
        returns (
            AivorVaultV2 vault,
            AivorControllerV2 controller,
            OrvexTreasury treasury,
            MorphoAllocatorV2 allocator
        )
    {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        DeployConfig memory config = _loadConfig();
        PredictedAddresses memory predicted = _predict(config.deployer);

        vm.startBroadcast(config.deployerPrivateKey);

        controller = new AivorControllerV2(config.safe, 2 days);
        treasury = new OrvexTreasury(config.treasuryWallet);
        vault = new AivorVaultV2(
            config.usdc,
            predicted.allocator,
            predicted.treasury,
            predicted.controller,
            config.validationWallet,
            config.validationDepositCap
        );
        allocator = new MorphoAllocatorV2(
            config.usdc,
            config.morpho,
            config.marketId,
            predicted.vault,
            predicted.controller,
            INITIAL_EXPOSURE_LIMIT,
            INITIAL_EXPOSURE_LIMIT,
            config.maxMarketDataAge
        );

        vm.stopBroadcast();

        require(address(controller) == predicted.controller, "CONTROLLER_PREDICTION");
        require(address(treasury) == predicted.treasury, "TREASURY_PREDICTION");
        require(address(vault) == predicted.vault, "VAULT_PREDICTION");
        require(address(allocator) == predicted.allocator, "ALLOCATOR_PREDICTION");
        require(!vault.idleOnlyMode(), "VAULT_IDLE_ONLY");
        require(address(vault.morphoAllocator()) == address(allocator), "VAULT_ALLOCATOR");
        require(allocator.vault() == address(vault), "ALLOCATOR_VAULT");
        require(allocator.controller() == address(controller), "ALLOCATOR_CONTROLLER");
        require(!allocator.protocolEnabled(), "PROTOCOL_ENABLED");
        require(!allocator.marketEnabled(), "MARKET_ENABLED");
        require(allocator.totalAssets() == 0, "ALLOCATOR_ASSETS");
    }

    function _loadConfig() private returns (DeployConfig memory config) {
        config.deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        config.deployer = vm.addr(config.deployerPrivateKey);
        config.usdc = vm.envAddress("USDC_ADDRESS");
        config.safe = vm.envAddress("SAFE_ADDRESS");
        config.treasuryWallet = vm.envAddress("TREASURY_WALLET");
        config.validationWallet = vm.envAddress("VALIDATION_WALLET");
        config.morpho = vm.envAddress("MORPHO_BLUE_ADDRESS");
        config.marketId = vm.envBytes32("MORPHO_MARKET_ID");
        config.validationDepositCap = vm.envUint("VALIDATION_DEPOSIT_CAP");
        config.maxMarketDataAge = vm.envUint("MORPHO_ALLOCATOR_MAX_MARKET_DATA_AGE");

        require(config.usdc == BASE_MAINNET_USDC, "USDC_BASE_MAINNET_ONLY");
        require(config.morpho == BASE_MORPHO_BLUE, "MORPHO_BLUE_BASE_ONLY");
        require(config.safe != address(0), "SAFE_ZERO");
        require(config.treasuryWallet != address(0), "TREASURY_ZERO");
        require(config.validationWallet != address(0), "VALIDATION_ZERO");
        require(config.validationDepositCap == INITIAL_EXPOSURE_LIMIT, "VALIDATION_CAP_NOT_1_USDC");
        require(config.maxMarketDataAge > 0, "STALE_LIMIT_ZERO");
    }

    function _predict(address deployer) private view returns (PredictedAddresses memory predicted) {
        uint256 nonce = vm.getNonce(deployer);
        predicted.controller = vm.computeCreateAddress(deployer, nonce);
        predicted.treasury = vm.computeCreateAddress(deployer, nonce + 1);
        predicted.vault = vm.computeCreateAddress(deployer, nonce + 2);
        predicted.allocator = vm.computeCreateAddress(deployer, nonce + 3);
    }
}
