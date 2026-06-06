// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface Vm {
    function addr(uint256 privateKey) external returns (address);
    function envAddress(string calldata key) external view returns (address);
    function envOr(string calldata key, uint256 defaultValue) external view returns (uint256);
    function envUint(string calldata key) external view returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

interface IMintableERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}

interface IERC4626Vault {
    function asset() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function sharePrice() external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
}

contract ValidateERC4626Testnet {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (uint256 sharesMinted, uint256 sharesBurned, uint256 finalAssetBalance) {
        uint256 privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address operator = vm.addr(privateKey);
        IERC4626Vault vault = IERC4626Vault(vm.envAddress("ORVEX_VAULT_ADDRESS"));
        IMintableERC20 asset = IMintableERC20(vault.asset());
        uint256 amount = vm.envOr("TEST_DEPOSIT_AMOUNT", uint256(100e6));

        uint256 balanceBefore = asset.balanceOf(operator);

        vm.startBroadcast(privateKey);
        asset.mint(operator, amount);
        require(asset.approve(address(vault), amount), "APPROVE_FAILED");
        sharesMinted = vault.deposit(amount, operator);
        require(sharesMinted > 0, "NO_SHARES_MINTED");
        require(vault.balanceOf(operator) == sharesMinted, "SHARE_BALANCE_MISMATCH");
        require(vault.convertToAssets(sharesMinted) == amount, "ASSET_PREVIEW_MISMATCH");
        require(vault.totalAssets() >= amount, "TOTAL_ASSETS_TOO_LOW");
        require(vault.totalSupply() >= sharesMinted, "TOTAL_SUPPLY_TOO_LOW");
        require(vault.sharePrice() == 1e6, "UNEXPECTED_SHARE_PRICE");

        sharesBurned = vault.withdraw(amount, operator, operator);
        require(sharesBurned == sharesMinted, "UNEXPECTED_SHARES_BURNED");
        require(vault.balanceOf(operator) == 0, "SHARES_LEFT");
        vm.stopBroadcast();

        finalAssetBalance = asset.balanceOf(operator);
        require(finalAssetBalance == balanceBefore + amount, "FINAL_BALANCE_MISMATCH");
    }
}
