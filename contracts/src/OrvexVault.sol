// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

interface IMorphoAllocator {
    function deposit(uint256 assets) external;
    function withdraw(uint256 assets) external returns (uint256);
    function totalAssets() external view returns (uint256);
    function liquidAssets() external view returns (uint256);
    function marketId() external view returns (bytes32);
    function isMarketEnabled() external view returns (bool);
    function isHealthy() external view returns (bool);
    function currentApyBps() external view returns (uint256);
    function utilizationBps() external view returns (uint256);
    function riskScoreBps() external view returns (uint256);
}

contract OrvexVault is ERC4626, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant MIN_IDLE_LIQUIDITY_BPS = 200;
    uint256 public constant DEFAULT_IDLE_LIQUIDITY_BPS = 500;
    uint256 public constant MAX_IDLE_LIQUIDITY_BPS = 700;
    uint256 public constant PERFORMANCE_FEE_BPS = 1_500;

    IMorphoAllocator public immutable morphoAllocator;
    address public immutable treasury;
    address public immutable controller;
    bool public immutable idleOnlyMode;
    address public immutable validationWallet;
    uint256 public immutable validationDepositCap;

    bool public strategiesPaused;
    bool public emergencyShutdown;
    uint256 public idleLiquidityBps;
    uint256 public highWatermarkAssets;

    event StrategiesPaused(bool paused);
    event EmergencyShutdown(bool enabled);
    event IdleLiquidityUpdated(uint256 idleLiquidityBps);
    event EmergencyLiquidityWithdrawn(uint256 requestedAssets, uint256 receivedAssets);
    event FeesAccrued(uint256 assets);
    event IdleOnlyModeEnabled();
    event PrivateValidationModeEnabled(address indexed validationWallet, uint256 depositCap);
    event AllocatorHealthCheckFailed(bytes32 indexed marketId);
    event AssetsAllocated(bytes32 indexed marketId, uint256 assets);
    event AllocatorLiquidityRequested(bytes32 indexed marketId, uint256 requestedAssets, uint256 receivedAssets);

    modifier onlyController() {
        require(msg.sender == controller, "ONLY_CONTROLLER");
        _;
    }

    modifier whenDepositsOpen() {
        require(!paused(), "PAUSED");
        require(!emergencyShutdown, "SHUTDOWN");
        _;
    }

    modifier whenStrategiesActive() {
        require(!paused(), "PAUSED");
        require(!strategiesPaused, "STRATEGIES_PAUSED");
        require(!emergencyShutdown, "SHUTDOWN");
        _;
    }

    constructor(
        address asset_,
        address morphoAllocator_,
        address treasury_,
        address controller_,
        bool idleOnlyMode_,
        address validationWallet_,
        uint256 validationDepositCap_
    )
        ERC20("Aivor Yield USDC", "ovUSDC")
        ERC4626(IERC20(asset_))
    {
        require(asset_ != address(0), "ASSET_ZERO");
        require(idleOnlyMode_ || morphoAllocator_ != address(0), "MORPHO_ZERO");
        require(treasury_ != address(0), "TREASURY_ZERO");
        require(controller_ != address(0), "CONTROLLER_ZERO");
        require(!idleOnlyMode_ || morphoAllocator_ == address(0), "ALLOCATOR_WITH_IDLE_ONLY");
        if (validationWallet_ != address(0)) {
            require(validationDepositCap_ > 0, "VALIDATION_CAP_ZERO");
        } else {
            require(validationDepositCap_ == 0, "VALIDATION_WALLET_ZERO");
        }
        morphoAllocator = IMorphoAllocator(morphoAllocator_);
        treasury = treasury_;
        controller = controller_;
        idleOnlyMode = idleOnlyMode_;
        validationWallet = validationWallet_;
        validationDepositCap = validationDepositCap_;
        idleLiquidityBps = DEFAULT_IDLE_LIQUIDITY_BPS;
        if (idleOnlyMode_) emit IdleOnlyModeEnabled();
        if (validationWallet_ != address(0)) emit PrivateValidationModeEnabled(validationWallet_, validationDepositCap_);
    }

    function decimals() public pure override(ERC4626) returns (uint8) {
        return 6;
    }

    function totalAssets() public view override returns (uint256) {
        uint256 liquid = IERC20(asset()).balanceOf(address(this));
        if (idleOnlyMode) return liquid;
        return liquid + morphoAllocator.totalAssets();
    }

    function convertToShares(uint256 assets) public view override returns (uint256) {
        uint256 supply = totalSupply();
        uint256 assetsBefore = totalAssets();
        if (supply == 0 || assetsBefore == 0) return assets;
        return Math.mulDiv(assets, supply, assetsBefore);
    }

    function convertToAssets(uint256 shares) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares;
        return Math.mulDiv(shares, totalAssets(), supply);
    }

    function previewDeposit(uint256 assets) public view override returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares;
        return Math.mulDiv(shares, totalAssets(), supply, Math.Rounding.Ceil);
    }

    function previewWithdraw(uint256 assets) public view override returns (uint256) {
        uint256 supply = totalSupply();
        uint256 assetsNow = totalAssets();
        if (supply == 0 || assetsNow == 0) return assets;
        return Math.mulDiv(assets, supply, assetsNow, Math.Rounding.Ceil);
    }

    function previewRedeem(uint256 shares) public view override returns (uint256) {
        return convertToAssets(shares);
    }

    function sharePrice() external view returns (uint256) {
        if (totalSupply() == 0) return 10 ** decimals();
        return convertToAssets(10 ** decimals());
    }

    function maxDeposit(address owner) public view override returns (uint256) {
        if (paused() || emergencyShutdown) return 0;
        if (validationWallet == address(0)) return super.maxDeposit(owner);
        if (owner != validationWallet) return 0;
        uint256 assetsNow = totalAssets();
        if (assetsNow >= validationDepositCap) return 0;
        return validationDepositCap - assetsNow;
    }

    function maxMint(address owner) public view override returns (uint256) {
        if (paused() || emergencyShutdown) return 0;
        if (validationWallet == address(0)) return super.maxMint(owner);
        return convertToShares(maxDeposit(owner));
    }

    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        whenDepositsOpen
        returns (uint256 shares)
    {
        _validatePrivateDeposit(assets, receiver);
        shares = super.deposit(assets, receiver);
        _afterAssetsAdded(assets);
    }

    function mint(uint256 shares, address receiver)
        public
        override
        nonReentrant
        whenDepositsOpen
        returns (uint256 assets)
    {
        assets = previewMint(shares);
        _validatePrivateDeposit(assets, receiver);
        assets = super.mint(shares, receiver);
        _afterAssetsAdded(assets);
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        nonReentrant
        returns (uint256 shares)
    {
        shares = previewWithdraw(assets);
        _ensureLiquidity(assets);
        super.withdraw(assets, receiver, owner);
        _reduceHighWatermark(assets);
    }

    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        nonReentrant
        returns (uint256 assets)
    {
        assets = previewRedeem(shares);
        _ensureLiquidity(assets);
        super.redeem(shares, receiver, owner);
        _reduceHighWatermark(assets);
    }

    function harvestPerformanceFee() external nonReentrant whenStrategiesActive returns (uint256 feeAssets) {
        uint256 assetsNow = totalAssets();
        if (assetsNow <= highWatermarkAssets) return 0;

        uint256 profit = assetsNow - highWatermarkAssets;
        feeAssets = (profit * PERFORMANCE_FEE_BPS) / BASIS_POINTS;
        if (feeAssets == 0) return 0;

        _ensureLiquidity(feeAssets);
        IERC20(asset()).safeTransfer(treasury, feeAssets);
        highWatermarkAssets = totalAssets();

        emit FeesAccrued(feeAssets);
    }

    function setPaused(bool nextPaused) external onlyController {
        if (nextPaused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function setStrategiesPaused(bool nextPaused) external onlyController {
        strategiesPaused = nextPaused;
        emit StrategiesPaused(nextPaused);
    }

    function setEmergencyShutdown(bool enabled) external onlyController {
        emergencyShutdown = enabled;
        if (enabled) {
            if (!paused()) _pause();
            strategiesPaused = true;
            emit StrategiesPaused(true);
        }
        emit EmergencyShutdown(enabled);
    }

    function setIdleLiquidityBps(uint256 nextIdleLiquidityBps) external onlyController {
        require(nextIdleLiquidityBps >= MIN_IDLE_LIQUIDITY_BPS, "IDLE_TOO_LOW");
        require(nextIdleLiquidityBps <= MAX_IDLE_LIQUIDITY_BPS, "IDLE_TOO_HIGH");
        idleLiquidityBps = nextIdleLiquidityBps;
        emit IdleLiquidityUpdated(nextIdleLiquidityBps);
    }

    function emergencyWithdrawFromAllocator(uint256 assets) external onlyController nonReentrant returns (uint256 received) {
        require(assets > 0, "ZERO_ASSETS");
        require(!idleOnlyMode, "IDLE_ONLY");
        require(_allocatorOperational(), "ALLOCATOR_UNHEALTHY");
        received = morphoAllocator.withdraw(assets);
        emit EmergencyLiquidityWithdrawn(assets, received);
    }

    function allocatorStatus()
        external
        view
        returns (
            bytes32 allocatorMarketId,
            bool marketEnabled,
            bool healthy,
            uint256 managedAssets,
            uint256 liquidAssets,
            uint256 currentApyBps,
            uint256 utilizationBps,
            uint256 riskScoreBps
        )
    {
        if (idleOnlyMode) return (bytes32(0), false, true, 0, IERC20(asset()).balanceOf(address(this)), 0, 0, 0);
        allocatorMarketId = morphoAllocator.marketId();
        marketEnabled = morphoAllocator.isMarketEnabled();
        healthy = morphoAllocator.isHealthy();
        managedAssets = morphoAllocator.totalAssets();
        liquidAssets = morphoAllocator.liquidAssets();
        currentApyBps = morphoAllocator.currentApyBps();
        utilizationBps = morphoAllocator.utilizationBps();
        riskScoreBps = morphoAllocator.riskScoreBps();
    }

    function _validatePrivateDeposit(uint256 assets, address receiver) internal view {
        if (validationWallet == address(0)) return;
        require(msg.sender == validationWallet, "VALIDATION_SENDER_ONLY");
        require(receiver == validationWallet, "VALIDATION_RECEIVER_ONLY");
        require(assets <= maxDeposit(receiver), "VALIDATION_CAP_EXCEEDED");
    }

    function _afterAssetsAdded(uint256 assets) internal {
        highWatermarkAssets += assets;
        _allocateExcessLiquidity();
    }

    function _allocateExcessLiquidity() internal {
        if (idleOnlyMode) return;
        if (strategiesPaused || emergencyShutdown) return;
        if (!_allocatorOperational()) {
            emit AllocatorHealthCheckFailed(morphoAllocator.marketId());
            return;
        }

        uint256 assetsNow = totalAssets();
        uint256 targetLiquid = (assetsNow * idleLiquidityBps) / BASIS_POINTS;
        uint256 liquid = IERC20(asset()).balanceOf(address(this));
        if (liquid <= targetLiquid) return;

        uint256 excess = liquid - targetLiquid;
        IERC20(asset()).safeTransfer(address(morphoAllocator), excess);
        morphoAllocator.deposit(excess);
        emit AssetsAllocated(morphoAllocator.marketId(), excess);
    }

    function _ensureLiquidity(uint256 assets) internal {
        uint256 liquid = IERC20(asset()).balanceOf(address(this));
        if (liquid >= assets) return;
        require(!idleOnlyMode, "INSUFFICIENT_LIQUIDITY");
        require(_allocatorOperational(), "ALLOCATOR_UNHEALTHY");

        uint256 received = morphoAllocator.withdraw(assets - liquid);
        emit AllocatorLiquidityRequested(morphoAllocator.marketId(), assets - liquid, received);
        require(received + liquid >= assets, "INSUFFICIENT_LIQUIDITY");
    }

    function _reduceHighWatermark(uint256 assets) internal {
        if (assets >= highWatermarkAssets) {
            highWatermarkAssets = 0;
            return;
        }
        highWatermarkAssets -= assets;
    }

    function _allocatorOperational() internal view returns (bool) {
        if (idleOnlyMode) return true;
        return morphoAllocator.isMarketEnabled() && morphoAllocator.isHealthy();
    }
}
