export type CurrencyCode = "USDC";

export interface AccountOverview {
  balanceUsd: string;
  earningsUsd: string;
  growthLabel: string;
  monthlyGrowth: string;
  currency: CurrencyCode;
}

export interface VaultStatus {
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  availableLiquidityUsd: string;
}

export interface StrategyAllocation {
  name: string;
  targetAllocation: string;
  currentAllocation: string;
  status: "active" | "paused" | "review";
}

export interface AdminVaultOverview {
  tvlUsd: string;
  yieldUsd: string;
  availableLiquidityUsd: string;
  feesGeneratedUsd: string;
  deposits24hUsd: string;
  withdrawals24hUsd: string;
  contractStatus: "healthy" | "paused" | "shutdown";
  multisigPolicy: string;
  timelockDelay: string;
  idleLiquidityTarget: string;
  dataSource: "mock" | "onchain";
  vaultAddress?: string;
  assetAddress?: string;
  shareToken: {
    name: "Aivor Yield USDC";
    ticker: "ovUSDC";
    model: "erc4626-share-price";
    rebasing: false;
  };
  strategies: StrategyAllocation[];
}

export interface OperationalPolicy {
  liquidity: {
    minBps: number;
    targetBps: number;
    maxBps: number;
  };
  governance: {
    multisig: string;
    timelockRequired: boolean;
    emergencyPauseAllowed: boolean;
  };
  supportedAssets: string[];
  enabledProtocols: string[];
  shareToken: {
    name: string;
    ticker: string;
    model: string;
    rebasing: boolean;
  };
  custody: {
    backendCustodiesFunds: boolean;
    databaseIsFinalFinancialSource: boolean;
    finalFinancialSource: string;
  };
}

export interface SystemHealth {
  backend: {
    status: string;
    service: string;
    timestamp: string;
  };
  database: {
    status: string;
    latencyMs?: number | null;
    error?: string;
  };
  rpc: {
    status: string;
    chainId: number | null;
    provider?: string;
    contracts?: Array<{
      name: string;
      address: string | null;
      configured: boolean;
      hasCode: boolean | null;
      status: string;
    }>;
    error?: string;
  };
  governance: {
    status: string;
    governance?: unknown;
    error?: string;
  };
  allocator?: {
    status: string;
    allocatorAddress?: string | null;
    chainId?: number | null;
    contractExists?: boolean;
    hasCode?: boolean | null;
    configurationOk?: boolean;
    protocolEnabled?: boolean;
    marketEnabled?: boolean;
    isHealthy?: boolean;
    stale?: boolean;
    lastRiskUpdate?: string | null;
    readOnly?: boolean;
    noCapital?: boolean;
    noSupply?: boolean;
    error?: string;
  };
}

export interface AllocatorStatus {
  status: "read_only" | "not_configured" | "missing_code";
  allocatorAddress: string | null;
  chainId: number | null;
  contractExists?: boolean;
  hasCode?: boolean;
  assetAddress?: string;
  morphoAddress?: string;
  vaultAddress?: string;
  controllerAddress?: string;
  protocolEnabled?: boolean;
  marketEnabled?: boolean;
  totalAssets?: string;
  liquidAssets?: string;
  exposureUsed?: string;
  exposureLimit?: string;
  totalExposureLimit?: string;
  exposureBps?: number;
  marketId?: string;
  isHealthy?: boolean;
  stale?: boolean;
  lastRiskUpdate?: string | null;
  maxMarketDataAgeSeconds?: number;
  utilizationBps?: number;
  currentApyBps?: number;
  riskScoreBps?: number;
  flags: {
    readOnly: true;
    noCapital: boolean;
    noSupply: boolean;
    backendCustodiesFunds: false;
  };
}

export type ReadinessStatus = "READY" | "NOT_READY" | "BLOCKED";

export interface ReadinessItem {
  key: string;
  label: string;
  status: ReadinessStatus;
  reason: string;
  source: "onchain" | "database" | "governance" | "runbook" | "admin_panel" | "configuration";
}

export interface AllocatorReadiness {
  status: ReadinessStatus;
  productionStatus: ReadinessStatus;
  devValidationStatus: ReadinessStatus;
  mode: "activation_preparation";
  generatedAt: string;
  allocatorAddress: string | null;
  checks: ReadinessItem[];
  production: {
    productionReadySafe: boolean;
    timelockConfigured: boolean;
    freshnessReady: boolean;
    readyForPublicLaunch: false;
  };
  devValidation: {
    devSafeAccepted: boolean;
    policyMismatchExpected: boolean;
    readyForNextPreparation: boolean;
    readyForCapitalMovement: false;
    reason: string;
  };
  capitalValidation: {
    status: ReadinessStatus;
    proposedCapitalOptions: string[];
    recommendedInitialCapital: string;
    maxCapital: string;
    exposureLimit: string;
    rollbackReady: boolean;
    proposalPrepared: boolean;
    successCriteria: string[];
    failureCriteria: string[];
    readyForFirstUsdc: false;
  };
  morphoPath: {
    status: ReadinessStatus;
    vaultConnectedToAllocator: boolean;
    allocatorConnectedToVault: boolean;
    allocatorConnectedToController: boolean;
    controllerCanOperateAllocator: boolean;
    operationalPathComplete: boolean;
    recommendedOption: "new_vault_and_controller" | "new_vault" | "new_controller" | "proxy_upgrade" | "none";
    diagnosis: string;
    v2DeployReady: boolean;
    v2NonceSafe: boolean;
    v2DryRunPassed: boolean;
    v2NoCapitalMovement: boolean;
    v2ReadyForBroadcast: boolean;
    activationSimulationPassed: boolean;
    sets: Array<{
      name: string;
      status: ReadinessStatus;
      vaultAddress: string | null;
      controllerAddress: string | null;
      allocatorAddress: string | null;
      pathComplete: boolean;
      note: string;
    }>;
  };
  activation: {
    protocolEnablePrepared: boolean;
    marketEnablePrepared: boolean;
    capitalMovementPrepared: false;
    realExecutionEnabled: false;
  };
  exposure: {
    maxMarketExposure: string;
    maxTotalExposure: string;
    initialCapitalLimit: string;
    idleLiquidityMinBps: number;
    idleLiquidityTargetBps: number;
    idleLiquidityMaxBps: number;
  };
  custody: {
    backendCustodiesFunds: false;
    noSupplyExecuted: true;
    noWithdrawExecuted: true;
    finalFinancialSource: "blockchain";
  };
}

export type MorphoMarketStatus = "eligible" | "watchlist" | "disabled" | "rejected";

export interface MorphoMarketRiskIndicators {
  oracleTrusted: boolean;
  governanceApproved: boolean;
  hasCriticalFlags: boolean;
  criticalFlags: string[];
}

export interface MorphoMarketReadOnly {
  marketId: string;
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltvBps: number;
  totalSupplyAssets: string;
  totalBorrowAssets: string;
  utilizationBps: number;
  supplyApyBps: number;
  liquidityAssets: string;
  riskScoreBps: number;
  status: MorphoMarketStatus;
  statusReason: string;
  approval?: {
    status: MorphoMarketStatus;
    reason: string;
    updatedAt: string;
  } | null;
  riskIndicators: MorphoMarketRiskIndicators;
  mode: "read_only";
}

export interface MorphoEligibilityCriteria {
  allowedLoanAssets: string[];
  minLiquidityAssets: string;
  minSupplyApyBps: number;
  maxSupplyApyBps: number;
  maxUtilizationBps: number;
  maxLltvBps: number;
  maxRiskScoreBps: number;
  requiresTrustedOracle: boolean;
  requiresGovernanceApproval: boolean;
}

export interface MorphoMarketsOverview {
  mode: "read_only";
  dataSource: "real" | "configured" | "fallback";
  lastUpdatedAt?: string | null;
  maxAgeSeconds?: number;
  stale?: boolean;
  criteria: MorphoEligibilityCriteria;
  markets: MorphoMarketReadOnly[];
  custody: {
    backendCustodiesFunds: false;
    readOnly: true;
    noSupplyExecuted: true;
    finalFinancialSource: "blockchain";
  };
}

export type MorphoSimulationOperation =
  | "deposit"
  | "allocation"
  | "yield"
  | "loss"
  | "rebalance"
  | "withdraw";

export type MorphoSimulationStatus = "idle" | "running" | "completed" | "failed";

export interface MorphoSimulationEvent {
  operation: MorphoSimulationOperation;
  marketId?: string | null;
  amountAssets: string;
  result: "success" | "failure";
  reason?: string;
  createdAt: string;
}

export interface MorphoSimulationPosition {
  marketId: string;
  allocatedAssets: string;
  simulatedYieldAssets: string;
  simulatedLossAssets: string;
  status: MorphoMarketStatus;
}

export interface MorphoSimulationOverview {
  mode: "simulated";
  status: MorphoSimulationStatus;
  totalAssets: string;
  totalSupply: string;
  sharePrice: string;
  idleAssets: string;
  allocatedAssets: string;
  simulatedYieldAssets: string;
  simulatedLossAssets: string;
  exposureBps: number;
  maxExposureBps: number;
  stale: boolean;
  lastUpdatedAt: string | null;
  positions: MorphoSimulationPosition[];
  recentEvents: MorphoSimulationEvent[];
  custody: {
    backendCustodiesFunds: false;
    simulatedOnly: true;
    noSupplyExecuted: true;
    finalFinancialSource: "blockchain";
  };
}
