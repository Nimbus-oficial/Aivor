// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IMorphoAllocator {
    function deposit(uint256 assets) external;
    function withdraw(uint256 assets) external returns (uint256);
    function totalAssets() external view returns (uint256);
}

contract OrvexVault {
    string public constant name = "Orvex USDC Vault";
    string public constant symbol = "orvUSDC";
    uint8 public constant decimals = 6;

    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant INTERNAL_LIQUIDITY_BPS = 1_000;
    uint256 public constant PERFORMANCE_FEE_BPS = 1_500;

    IERC20 public immutable assetToken;
    IMorphoAllocator public immutable morphoAllocator;
    address public immutable treasury;
    address public immutable controller;

    bool public paused;
    uint256 public totalSupply;
    uint256 public highWatermarkAssets;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Paused(bool paused);
    event FeesAccrued(uint256 assets);

    modifier onlyController() {
        require(msg.sender == controller, "ONLY_CONTROLLER");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "PAUSED");
        _;
    }

    constructor(address asset_, address morphoAllocator_, address treasury_, address controller_) {
        require(asset_ != address(0), "ASSET_ZERO");
        require(morphoAllocator_ != address(0), "MORPHO_ZERO");
        require(treasury_ != address(0), "TREASURY_ZERO");
        require(controller_ != address(0), "CONTROLLER_ZERO");
        assetToken = IERC20(asset_);
        morphoAllocator = IMorphoAllocator(morphoAllocator_);
        treasury = treasury_;
        controller = controller_;
    }

    function asset() external view returns (address) {
        return address(assetToken);
    }

    function totalAssets() public view returns (uint256) {
        return assetToken.balanceOf(address(this)) + morphoAllocator.totalAssets();
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply;
        uint256 assetsBefore = totalAssets();
        if (supply == 0 || assetsBefore == 0) return assets;
        return (assets * supply) / assetsBefore;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewMint(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        uint256 assets = (shares * totalAssets()) / supply;
        if ((assets * supply) / totalAssets() < shares) assets += 1;
        return assets;
    }

    function previewWithdraw(uint256 assets) public view returns (uint256 shares) {
        shares = convertToShares(assets);
        if (convertToAssets(shares) < assets) shares += 1;
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function maxDeposit(address) external view returns (uint256) {
        return paused ? 0 : type(uint256).max;
    }

    function maxMint(address) external view returns (uint256) {
        return paused ? 0 : type(uint256).max;
    }

    function maxWithdraw(address owner) external view returns (uint256) {
        return paused ? 0 : convertToAssets(balanceOf[owner]);
    }

    function maxRedeem(address owner) external view returns (uint256) {
        return paused ? 0 : balanceOf[owner];
    }

    function deposit(uint256 assets, address receiver) external whenNotPaused returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        require(receiver != address(0), "RECEIVER_ZERO");

        shares = convertToShares(assets);
        require(shares > 0, "ZERO_SHARES");

        _transferIn(msg.sender, assets);
        _mint(receiver, shares);
        _allocateExcessLiquidity();
        highWatermarkAssets += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function mint(uint256 shares, address receiver) external whenNotPaused returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        require(receiver != address(0), "RECEIVER_ZERO");

        assets = previewMint(shares);
        require(assets > 0, "ZERO_ASSETS");

        _transferIn(msg.sender, assets);
        _mint(receiver, shares);
        _allocateExcessLiquidity();
        highWatermarkAssets += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    function withdraw(uint256 assets, address receiver, address owner) external whenNotPaused returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        require(receiver != address(0), "RECEIVER_ZERO");

        shares = previewWithdraw(assets);

        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender];
            require(allowed >= shares, "ALLOWANCE");
            allowance[owner][msg.sender] = allowed - shares;
            emit Approval(owner, msg.sender, allowance[owner][msg.sender]);
        }

        _burn(owner, shares);
        _ensureLiquidity(assets);
        require(assetToken.transfer(receiver, assets), "TRANSFER_OUT_FAILED");
        _reduceHighWatermark(assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    function redeem(uint256 shares, address receiver, address owner) external whenNotPaused returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        require(receiver != address(0), "RECEIVER_ZERO");

        if (msg.sender != owner) {
            uint256 allowed = allowance[owner][msg.sender];
            require(allowed >= shares, "ALLOWANCE");
            allowance[owner][msg.sender] = allowed - shares;
            emit Approval(owner, msg.sender, allowance[owner][msg.sender]);
        }

        assets = convertToAssets(shares);
        _burn(owner, shares);
        _ensureLiquidity(assets);
        require(assetToken.transfer(receiver, assets), "TRANSFER_OUT_FAILED");
        _reduceHighWatermark(assets);

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transferShares(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE");
        allowance[from][msg.sender] = allowed - amount;
        emit Approval(from, msg.sender, allowance[from][msg.sender]);
        _transferShares(from, to, amount);
        return true;
    }

    function harvestPerformanceFee() external whenNotPaused returns (uint256 feeAssets) {
        uint256 assetsNow = totalAssets();
        if (assetsNow <= highWatermarkAssets) return 0;

        uint256 profit = assetsNow - highWatermarkAssets;
        feeAssets = (profit * PERFORMANCE_FEE_BPS) / BASIS_POINTS;
        if (feeAssets == 0) return 0;

        _ensureLiquidity(feeAssets);
        require(assetToken.transfer(treasury, feeAssets), "FEE_TRANSFER_FAILED");
        highWatermarkAssets = totalAssets();

        emit FeesAccrued(feeAssets);
    }

    function setPaused(bool nextPaused) external onlyController {
        paused = nextPaused;
        emit Paused(nextPaused);
    }

    function _allocateExcessLiquidity() internal {
        uint256 assetsNow = totalAssets();
        uint256 targetLiquid = (assetsNow * INTERNAL_LIQUIDITY_BPS) / BASIS_POINTS;
        uint256 liquid = assetToken.balanceOf(address(this));
        if (liquid <= targetLiquid) return;

        uint256 excess = liquid - targetLiquid;
        require(assetToken.transfer(address(morphoAllocator), excess), "ALLOCATE_TRANSFER_FAILED");
        morphoAllocator.deposit(excess);
    }

    function _ensureLiquidity(uint256 assets) internal {
        uint256 liquid = assetToken.balanceOf(address(this));
        if (liquid >= assets) return;

        uint256 received = morphoAllocator.withdraw(assets - liquid);
        require(received + liquid >= assets, "INSUFFICIENT_LIQUIDITY");
    }

    function _reduceHighWatermark(uint256 assets) internal {
        if (assets >= highWatermarkAssets) {
            highWatermarkAssets = 0;
            return;
        }
        highWatermarkAssets -= assets;
    }

    function _transferIn(address from, uint256 amount) internal {
        require(assetToken.transferFrom(from, address(this), amount), "TRANSFER_IN_FAILED");
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        uint256 balance = balanceOf[from];
        require(balance >= amount, "BALANCE");
        balanceOf[from] = balance - amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _transferShares(address from, address to, uint256 amount) internal {
        require(to != address(0), "TO_ZERO");
        uint256 balance = balanceOf[from];
        require(balance >= amount, "BALANCE");
        balanceOf[from] = balance - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
