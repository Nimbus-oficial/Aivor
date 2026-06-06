// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IMorphoBlue {
    struct MarketParams {
        address loanToken;
        address collateralToken;
        address oracle;
        address irm;
        uint256 lltv;
    }

    struct Market {
        uint128 totalSupplyAssets;
        uint128 totalSupplyShares;
        uint128 totalBorrowAssets;
        uint128 totalBorrowShares;
        uint128 lastUpdate;
        uint128 fee;
    }

    struct Position {
        uint256 supplyShares;
        uint128 borrowShares;
        uint128 collateral;
    }

    function idToMarketParams(bytes32 id) external view returns (MarketParams memory);
    function market(bytes32 id) external view returns (Market memory);
    function position(bytes32 id, address user) external view returns (Position memory);
    function supply(MarketParams memory marketParams, uint256 assets, uint256 shares, address onBehalf, bytes memory data)
        external
        returns (uint256 assetsSupplied, uint256 sharesSupplied);
    function withdraw(MarketParams memory marketParams, uint256 assets, uint256 shares, address onBehalf, address receiver)
        external
        returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn);
}

contract MorphoAllocator is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10_000;

    IERC20 public immutable asset;
    IMorphoBlue public immutable morpho;
    address public immutable vault;
    address public immutable controller;
    bytes32 public immutable marketId;
    IMorphoBlue.MarketParams public marketParams;

    uint256 public maxMarketExposure;
    uint256 public maxTotalExposure;
    uint256 public maxUtilizationBps;
    uint256 public maxRiskScoreBps;
    uint256 public marketDataUpdatedAt;
    uint256 public maxMarketDataAge;
    uint256 public currentApyBps;
    uint256 public riskScoreBps;
    bool public marketEnabled;
    bool public protocolEnabled;

    event MorphoAllocationExecuted(bytes32 indexed marketId, uint256 assets, uint256 shares);
    event MorphoWithdrawExecuted(bytes32 indexed marketId, uint256 assets, uint256 shares);
    event MorphoEmergencyWithdraw(bytes32 indexed marketId, uint256 requestedAssets, uint256 receivedAssets);
    event MorphoMarketLimitHit(bytes32 indexed marketId, uint256 requestedExposure, uint256 limit);
    event MorphoMarketBlocked(bytes32 indexed marketId, string reason);
    event MorphoRiskDataUpdated(bytes32 indexed marketId, uint256 apyBps, uint256 riskScoreBps, uint256 updatedAt);
    event MorphoMarketEnabled(bytes32 indexed marketId, bool enabled);
    event MorphoProtocolEnabled(bool enabled);
    event MorphoLimitsUpdated(uint256 maxMarketExposure, uint256 maxTotalExposure);

    modifier onlyVault() {
        require(msg.sender == vault, "ONLY_VAULT");
        _;
    }

    modifier onlyController() {
        require(msg.sender == controller, "ONLY_CONTROLLER");
        _;
    }

    constructor(
        address asset_,
        address morpho_,
        bytes32 marketId_,
        address vault_,
        address controller_,
        uint256 maxMarketExposure_,
        uint256 maxTotalExposure_,
        uint256 maxMarketDataAge_
    ) {
        require(asset_ != address(0), "ASSET_ZERO");
        require(morpho_ != address(0), "MORPHO_ZERO");
        require(marketId_ != bytes32(0), "MARKET_ZERO");
        require(vault_ != address(0), "VAULT_ZERO");
        require(controller_ != address(0), "CONTROLLER_ZERO");
        require(maxMarketExposure_ > 0, "MARKET_LIMIT_ZERO");
        require(maxTotalExposure_ > 0, "TOTAL_LIMIT_ZERO");
        require(maxMarketDataAge_ > 0, "STALE_LIMIT_ZERO");

        asset = IERC20(asset_);
        morpho = IMorphoBlue(morpho_);
        vault = vault_;
        controller = controller_;
        marketId = marketId_;
        marketParams = morpho.idToMarketParams(marketId_);
        require(marketParams.loanToken == asset_, "LOAN_TOKEN_MISMATCH");

        maxMarketExposure = maxMarketExposure_;
        maxTotalExposure = maxTotalExposure_;
        maxMarketDataAge = maxMarketDataAge_;
        maxUtilizationBps = 9_000;
        maxRiskScoreBps = 2_500;
        marketEnabled = false;
        protocolEnabled = false;
    }

    function deposit(uint256 assets) external onlyVault nonReentrant whenNotPaused {
        require(assets > 0, "ZERO_ASSETS");
        require(_isOperational(), "ALLOCATOR_NOT_OPERATIONAL");

        uint256 nextExposure = totalAssets() + assets;
        if (nextExposure > maxMarketExposure) {
            emit MorphoMarketLimitHit(marketId, nextExposure, maxMarketExposure);
            revert("MARKET_EXPOSURE_LIMIT");
        }
        if (nextExposure > maxTotalExposure) {
            emit MorphoMarketLimitHit(marketId, nextExposure, maxTotalExposure);
            revert("TOTAL_EXPOSURE_LIMIT");
        }

        asset.forceApprove(address(morpho), assets);
        (uint256 supplied, uint256 shares) = morpho.supply(marketParams, assets, 0, address(this), "");
        emit MorphoAllocationExecuted(marketId, supplied, shares);
    }

    function withdraw(uint256 assets) external onlyVault nonReentrant returns (uint256 received) {
        require(assets > 0, "ZERO_ASSETS");
        require(protocolEnabled, "PROTOCOL_DISABLED");
        require(marketEnabled, "MARKET_DISABLED");

        uint256 available = liquidAssets();
        uint256 requested = assets <= available ? assets : available;
        require(requested > 0, "NO_LIQUIDITY");
        uint256 shares;
        (received, shares) = morpho.withdraw(marketParams, requested, 0, address(this), msg.sender);
        emit MorphoWithdrawExecuted(marketId, received, shares);
    }

    function emergencyWithdraw(uint256 assets) external onlyController nonReentrant returns (uint256 received) {
        uint256 available = liquidAssets();
        uint256 requested = assets <= available ? assets : available;
        require(requested > 0, "NO_LIQUIDITY");
        (received,) = morpho.withdraw(marketParams, requested, 0, address(this), vault);
        emit MorphoEmergencyWithdraw(marketId, assets, received);
    }

    function setPaused(bool nextPaused) external onlyController {
        if (nextPaused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function setMarketEnabled(bool enabled) external onlyController {
        marketEnabled = enabled;
        emit MorphoMarketEnabled(marketId, enabled);
    }

    function setProtocolEnabled(bool enabled) external onlyController {
        protocolEnabled = enabled;
        emit MorphoProtocolEnabled(enabled);
    }

    function setExposureLimits(uint256 nextMaxMarketExposure, uint256 nextMaxTotalExposure) external onlyController {
        require(nextMaxMarketExposure > 0, "MARKET_LIMIT_ZERO");
        require(nextMaxTotalExposure > 0, "TOTAL_LIMIT_ZERO");
        maxMarketExposure = nextMaxMarketExposure;
        maxTotalExposure = nextMaxTotalExposure;
        emit MorphoLimitsUpdated(nextMaxMarketExposure, nextMaxTotalExposure);
    }

    function setRiskLimits(uint256 nextMaxUtilizationBps, uint256 nextMaxRiskScoreBps) external onlyController {
        require(nextMaxUtilizationBps <= BASIS_POINTS, "UTILIZATION_TOO_HIGH");
        require(nextMaxRiskScoreBps <= BASIS_POINTS, "RISK_TOO_HIGH");
        maxUtilizationBps = nextMaxUtilizationBps;
        maxRiskScoreBps = nextMaxRiskScoreBps;
    }

    function updateRiskData(uint256 nextApyBps, uint256 nextRiskScoreBps) external onlyController {
        currentApyBps = nextApyBps;
        riskScoreBps = nextRiskScoreBps;
        marketDataUpdatedAt = block.timestamp;
        emit MorphoRiskDataUpdated(marketId, nextApyBps, nextRiskScoreBps, block.timestamp);
    }

    function totalAssets() public view returns (uint256) {
        IMorphoBlue.Position memory userPosition = morpho.position(marketId, address(this));
        if (userPosition.supplyShares == 0) return 0;

        IMorphoBlue.Market memory marketState = morpho.market(marketId);
        if (marketState.totalSupplyShares == 0) return 0;
        return Math.mulDiv(userPosition.supplyShares, marketState.totalSupplyAssets, marketState.totalSupplyShares);
    }

    function liquidAssets() public view returns (uint256) {
        uint256 suppliedAssets = totalAssets();
        uint256 morphoLiquidity = asset.balanceOf(address(morpho));
        return suppliedAssets < morphoLiquidity ? suppliedAssets : morphoLiquidity;
    }

    function isMarketEnabled() external view returns (bool) {
        return marketEnabled;
    }

    function isHealthy() public view returns (bool) {
        return _isOperational();
    }

    function utilizationBps() public view returns (uint256) {
        IMorphoBlue.Market memory marketState = morpho.market(marketId);
        if (marketState.totalSupplyAssets == 0) return 0;
        return Math.mulDiv(marketState.totalBorrowAssets, BASIS_POINTS, marketState.totalSupplyAssets);
    }

    function _isOperational() internal view returns (bool) {
        if (paused()) return false;
        if (!protocolEnabled || !marketEnabled) return false;
        if (_isStale()) return false;
        if (utilizationBps() > maxUtilizationBps) return false;
        if (riskScoreBps > maxRiskScoreBps) return false;
        return true;
    }

    function _isStale() internal view returns (bool) {
        if (marketDataUpdatedAt == 0) return true;
        return block.timestamp - marketDataUpdatedAt > maxMarketDataAge;
    }
}
