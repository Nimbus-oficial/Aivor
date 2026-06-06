// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockMorphoAllocator {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    uint256 public managedAssets;

    event MockAllocated(uint256 assets);
    event MockWithdrawn(uint256 requestedAssets, uint256 returnedAssets);
    event MockYieldAdded(uint256 assets);

    constructor(address asset_) {
        require(asset_ != address(0), "ASSET_ZERO");
        asset = IERC20(asset_);
    }

    function deposit(uint256 assets) external {
        managedAssets += assets;
        emit MockAllocated(assets);
    }

    function withdraw(uint256 assets) external returns (uint256 returnedAssets) {
        returnedAssets = assets <= managedAssets ? assets : managedAssets;
        managedAssets -= returnedAssets;
        asset.safeTransfer(msg.sender, returnedAssets);
        emit MockWithdrawn(assets, returnedAssets);
    }

    function totalAssets() external view returns (uint256) {
        return managedAssets;
    }

    function addYield(uint256 assets) external {
        (bool success,) = address(asset).call(abi.encodeWithSignature("mint(address,uint256)", address(this), assets));
        require(success, "YIELD_MINT_FAILED");
        managedAssets += assets;
        emit MockYieldAdded(assets);
    }
}
