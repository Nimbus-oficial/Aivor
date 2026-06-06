// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../src/MorphoAllocator.sol";

interface VmFork {
    function createSelectFork(string calldata url) external returns (uint256 forkId);
    function prank(address msgSender) external;
}

contract MorphoAllocatorForkTest {
    VmFork private constant vm = VmFork(address(uint160(uint256(keccak256("hevm cheat code")))));

    address private constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address private constant MORPHO_BLUE = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    bytes32 private constant USDC_CBBTC_MARKET =
        0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836;
    address private constant VAULT = address(0xA110);
    address private constant CONTROLLER = address(0xC041);

    function testForkReadsRealBaseMorphoMarketAndInitializesAllocator() external {
        vm.createSelectFork("https://mainnet.base.org");

        MorphoAllocator allocator = new MorphoAllocator(
            BASE_USDC,
            MORPHO_BLUE,
            USDC_CBBTC_MARKET,
            VAULT,
            CONTROLLER,
            1_000e6,
            1_000e6,
            1 days
        );

        IMorphoBlue.MarketParams memory params = IMorphoBlue(MORPHO_BLUE).idToMarketParams(USDC_CBBTC_MARKET);
        IMorphoBlue.Market memory state = IMorphoBlue(MORPHO_BLUE).market(USDC_CBBTC_MARKET);

        require(params.loanToken == BASE_USDC, "BASE_USDC");
        require(params.collateralToken != address(0), "COLLATERAL");
        require(params.oracle != address(0), "ORACLE");
        require(state.totalSupplyAssets > 0, "SUPPLY_ASSETS");
        require(allocator.marketId() == USDC_CBBTC_MARKET, "MARKET_ID");
        require(allocator.totalAssets() == 0, "ALLOCATOR_POSITION");
        require(!allocator.isHealthy(), "DISABLED_BY_DEFAULT");

        vm.prank(CONTROLLER);
        allocator.setProtocolEnabled(true);
        vm.prank(CONTROLLER);
        allocator.setMarketEnabled(true);
        vm.prank(CONTROLLER);
        allocator.updateRiskData(400, 1_000);

        require(allocator.isHealthy(), "HEALTHY_AFTER_GOVERNED_ENABLE");
    }

    function testForkSupplyWithdrawAndAccountingAgainstRealMorpho() external {
        vm.createSelectFork("https://mainnet.base.org");

        MorphoAllocator allocator = new MorphoAllocator(
            BASE_USDC,
            MORPHO_BLUE,
            USDC_CBBTC_MARKET,
            VAULT,
            CONTROLLER,
            10e6,
            10e6,
            1 days
        );
        vm.prank(CONTROLLER);
        allocator.setProtocolEnabled(true);
        vm.prank(CONTROLLER);
        allocator.setMarketEnabled(true);
        vm.prank(CONTROLLER);
        allocator.updateRiskData(400, 1_000);

        uint256 assets = 1e6;
        vm.prank(MORPHO_BLUE);
        IERC20(BASE_USDC).transfer(VAULT, assets);
        vm.prank(VAULT);
        IERC20(BASE_USDC).transfer(address(allocator), assets);
        vm.prank(VAULT);
        allocator.deposit(assets);

        require(allocator.totalAssets() >= assets - 1, "FORK_SUPPLY_ACCOUNTING");
        require(allocator.liquidAssets() >= assets - 1, "FORK_LIQUIDITY");

        uint256 vaultBalanceBefore = IERC20(BASE_USDC).balanceOf(VAULT);
        vm.prank(VAULT);
        uint256 received = allocator.withdraw(assets);

        require(received >= assets - 1, "FORK_WITHDRAW_RECEIVED");
        require(IERC20(BASE_USDC).balanceOf(VAULT) >= vaultBalanceBefore + assets - 1, "FORK_VAULT_USDC");
        require(allocator.totalAssets() <= 1, "FORK_POSITION_CLOSED");
    }
}
