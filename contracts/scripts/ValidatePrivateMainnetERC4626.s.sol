// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface Vm {
    function addr(uint256 privateKey) external returns (address);
    function envAddress(string calldata key) external view returns (address);
    function envOr(string calldata key, bool defaultValue) external view returns (bool);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

interface IERC20Mainnet {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IPrivateValidationVault {
    function asset() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function idleOnlyMode() external view returns (bool);
    function maxDeposit(address owner) external view returns (uint256);
    function sharePrice() external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function validationWallet() external view returns (address);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
}

interface IValidationController {
    function emergencyPause(address vault) external;
}

contract ValidatePrivateMainnetERC4626 {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    uint256 private constant BASE_MAINNET_CHAIN_ID = 8453;

    function run() external returns (uint256 sharesMinted, uint256 sharesBurned, uint256 finalAssetBalance) {
        require(block.chainid == BASE_MAINNET_CHAIN_ID, "BASE_MAINNET_ONLY");

        uint256 privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address operator = vm.addr(privateKey);
        IPrivateValidationVault vault = IPrivateValidationVault(vm.envAddress("ORVEX_VAULT_ADDRESS"));
        IValidationController controller = IValidationController(vm.envAddress("ORVEX_CONTROLLER_ADDRESS"));
        IERC20Mainnet usdc = IERC20Mainnet(vault.asset());
        uint256 amount = vm.envUint("PRIVATE_VALIDATION_AMOUNT");
        bool pauseAfterValidation = vm.envOr("PAUSE_AFTER_VALIDATION", true);

        require(address(usdc) == BASE_MAINNET_USDC, "USDC_BASE_MAINNET_ONLY");
        require(vault.idleOnlyMode(), "NOT_IDLE_ONLY");
        require(vault.validationWallet() == operator, "NOT_VALIDATION_WALLET");
        require(amount > 0, "ZERO_AMOUNT");
        require(amount <= vault.maxDeposit(operator), "AMOUNT_ABOVE_MAX_DEPOSIT");

        uint256 balanceBefore = usdc.balanceOf(operator);
        require(balanceBefore >= amount, "INSUFFICIENT_USDC");

        vm.startBroadcast(privateKey);
        require(usdc.approve(address(vault), amount), "APPROVE_FAILED");
        sharesMinted = vault.deposit(amount, operator);
        require(sharesMinted > 0, "NO_SHARES_MINTED");
        require(vault.balanceOf(operator) == sharesMinted, "SHARE_BALANCE_MISMATCH");
        require(vault.convertToAssets(sharesMinted) == amount, "ASSET_PREVIEW_MISMATCH");
        require(vault.totalAssets() == amount, "TOTAL_ASSETS_MISMATCH");
        require(vault.totalSupply() == sharesMinted, "TOTAL_SUPPLY_MISMATCH");
        require(vault.sharePrice() == 1e6, "UNEXPECTED_SHARE_PRICE");

        sharesBurned = vault.withdraw(amount, operator, operator);
        require(sharesBurned == sharesMinted, "UNEXPECTED_SHARES_BURNED");
        require(vault.balanceOf(operator) == 0, "SHARES_LEFT");

        if (pauseAfterValidation) {
            controller.emergencyPause(address(vault));
        }
        vm.stopBroadcast();

        finalAssetBalance = usdc.balanceOf(operator);
        require(finalAssetBalance == balanceBefore, "FINAL_BALANCE_MISMATCH");
    }
}
