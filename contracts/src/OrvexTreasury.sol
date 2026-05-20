// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract OrvexTreasury {
    address public immutable treasuryWallet;

    event FeeReceived(address indexed asset, uint256 amount);

    constructor(address initialTreasuryWallet) {
        require(initialTreasuryWallet != address(0), "TREASURY_ZERO");
        treasuryWallet = initialTreasuryWallet;
    }

    function notifyFee(address asset, uint256 amount) external {
        emit FeeReceived(asset, amount);
    }
}
