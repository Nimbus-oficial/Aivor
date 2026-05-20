// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/OrvexVault.sol";

contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "BALANCE");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "BALANCE");
        require(allowance[from][msg.sender] >= amount, "ALLOWANCE");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockMorphoAllocator {
    MockUSDC public immutable usdc;
    uint256 public managedAssets;

    constructor(MockUSDC usdc_) {
        usdc = usdc_;
    }

    function deposit(uint256 assets) external {
        managedAssets += assets;
    }

    function withdraw(uint256 assets) external returns (uint256) {
        uint256 available = assets <= managedAssets ? assets : managedAssets;
        managedAssets -= available;
        require(usdc.transfer(msg.sender, available), "TRANSFER_FAILED");
        return available;
    }

    function totalAssets() external view returns (uint256) {
        return managedAssets;
    }

    function addYield(uint256 assets) external {
        usdc.mint(address(this), assets);
        managedAssets += assets;
    }
}

contract OrvexVaultTest {
    MockUSDC private usdc;
    MockMorphoAllocator private allocator;
    OrvexVault private vault;

    address private constant TREASURY = address(0x1001);
    address private constant CONTROLLER = address(0x1002);

    constructor() {
        usdc = new MockUSDC();
        allocator = new MockMorphoAllocator(usdc);
        vault = new OrvexVault(address(usdc), address(allocator), TREASURY, CONTROLLER);
    }

    function testDepositKeepsTenPercentLiquid() external {
        usdc.mint(address(this), 1_000e6);
        usdc.approve(address(vault), 1_000e6);

        uint256 shares = vault.deposit(1_000e6, address(this));

        require(shares == 1_000e6, "SHARES");
        require(usdc.balanceOf(address(vault)) == 100e6, "LIQUID");
        require(allocator.managedAssets() == 900e6, "ALLOCATED");
    }

    function testPerformanceFeeAppliesOnlyToYield() external {
        usdc.mint(address(this), 1_000e6);
        usdc.approve(address(vault), 1_000e6);
        vault.deposit(1_000e6, address(this));

        allocator.addYield(100e6);
        uint256 fee = vault.harvestPerformanceFee();

        require(fee == 15e6, "FEE");
        require(usdc.balanceOf(TREASURY) == 15e6, "TREASURY");
    }
}
