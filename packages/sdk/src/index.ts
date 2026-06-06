import type {
  AccountOverview,
  AllocatorReadiness,
  AdminVaultOverview,
  AllocatorStatus,
  MorphoSimulationOverview,
  MorphoMarketsOverview,
  OperationalPolicy,
  SystemHealth,
  VaultStatus
} from "@orvex/types";

const defaultApiBaseUrl = "http://localhost:4000";

export function getAccountOverview(): AccountOverview {
  return {
    balanceUsd: "US$ 12.842,60",
    earningsUsd: "US$ 342,60",
    growthLabel: "+2,74%",
    monthlyGrowth: "+US$ 42,10 este mes",
    currency: "USDC"
  };
}

export async function getAccountOverviewFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<AccountOverview> {
  return getJson<AccountOverview>(
    `${apiBaseUrl}/vault/account-summary`,
    getAccountOverview()
  );
}

export function getVaultStatus(): VaultStatus {
  return {
    depositsEnabled: true,
    withdrawalsEnabled: true,
    availableLiquidityUsd: "US$ 1.284.260,00"
  };
}

export function getAdminVaultOverview(): AdminVaultOverview {
  return {
    tvlUsd: "US$ 18.420.900",
    yieldUsd: "US$ 284.610",
    availableLiquidityUsd: "US$ 1.842.090",
    feesGeneratedUsd: "US$ 42.691",
    deposits24hUsd: "US$ 920.000",
    withdrawals24hUsd: "US$ 310.000",
    contractStatus: "healthy",
    multisigPolicy: "Safe 2-of-4",
    timelockDelay: "24h",
    idleLiquidityTarget: "5%",
    dataSource: "mock",
    shareToken: {
      name: "Aivor Yield USDC",
      ticker: "ovUSDC",
      model: "erc4626-share-price",
      rebasing: false
    },
    strategies: [
      {
        name: "Morpho Market A",
        targetAllocation: "70%",
        currentAllocation: "68%",
        status: "active"
      },
      {
        name: "Morpho Market B",
        targetAllocation: "20%",
        currentAllocation: "22%",
        status: "active"
      },
      {
        name: "Idle Liquidity",
        targetAllocation: "5%",
        currentAllocation: "5%",
        status: "active"
      }
    ]
  };
}

export async function getAdminVaultOverviewFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<AdminVaultOverview> {
  return getJson<AdminVaultOverview>(
    `${apiBaseUrl}/vault/admin-overview`,
    getAdminVaultOverview()
  );
}

export interface GovernanceProposalSummary {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface GovernanceOverview {
  mode: string;
  safeConfigured: boolean;
  timelockConfigured: boolean;
  safeAddress: string | null;
  safeChainId: number | null;
  safeStatus: string;
  safeThreshold: number | null;
  safeOwners: string[];
  safePolicyMatches: boolean | null;
  proposals: GovernanceProposalSummary[];
}

export async function getGovernanceOverviewFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<GovernanceOverview> {
  try {
    const [statusResponse, proposalsResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/governance/safe/status`, {
        cache: "no-store",
        headers: { accept: "application/json" }
      }),
      fetch(`${apiBaseUrl}/governance/proposals`, {
        cache: "no-store",
        headers: { accept: "application/json" }
      })
    ]);

    if (!statusResponse.ok || !proposalsResponse.ok) {
      return getGovernanceOverview();
    }

    const statusPayload = (await statusResponse.json()) as {
      data?: {
        mode?: string;
        status?: string;
        safe?: {
          address?: string | null;
          chainId?: number | null;
          configured?: boolean;
          policyMatches?: boolean | null;
          api?: {
            threshold?: number | null;
            owners?: string[] | null;
          };
        };
        timelock?: {
          configured?: boolean;
        };
      };
    };
    const proposalsPayload = (await proposalsResponse.json()) as {
      data?: GovernanceProposalSummary[];
    };

    return {
      mode: statusPayload.data?.mode ?? "simulated",
      safeConfigured: Boolean(statusPayload.data?.safe?.configured),
      timelockConfigured: Boolean(statusPayload.data?.timelock?.configured),
      safeAddress: statusPayload.data?.safe?.address ?? null,
      safeChainId: statusPayload.data?.safe?.chainId ?? null,
      safeStatus: statusPayload.data?.status ?? "pending",
      safeThreshold: statusPayload.data?.safe?.api?.threshold ?? null,
      safeOwners: statusPayload.data?.safe?.api?.owners ?? [],
      safePolicyMatches: statusPayload.data?.safe?.policyMatches ?? null,
      proposals: proposalsPayload.data ?? []
    };
  } catch {
    return getGovernanceOverview();
  }
}

export function getGovernanceOverview(): GovernanceOverview {
  return {
    mode: "simulated",
    safeConfigured: false,
    timelockConfigured: false,
    safeAddress: null,
    safeChainId: null,
    safeStatus: "simulated",
    safeThreshold: null,
    safeOwners: [],
    safePolicyMatches: null,
    proposals: []
  };
}

export function getOperationalPolicy(): OperationalPolicy {
  return {
    liquidity: {
      minBps: 200,
      targetBps: 500,
      maxBps: 700
    },
    governance: {
      multisig: "Safe 2-of-4",
      timelockRequired: true,
      emergencyPauseAllowed: true
    },
    supportedAssets: ["USDC", "EURC"],
    enabledProtocols: ["Morpho"],
    shareToken: {
      name: "Aivor Yield USDC",
      ticker: "ovUSDC",
      model: "ERC4626 yield-bearing share",
      rebasing: false
    },
    custody: {
      backendCustodiesFunds: false,
      databaseIsFinalFinancialSource: false,
      finalFinancialSource: "blockchain"
    }
  };
}

export async function getOperationalPolicyFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<OperationalPolicy> {
  return getApiData<OperationalPolicy>(
    `${apiBaseUrl}/operations/policy`,
    getOperationalPolicy()
  );
}

export function getSystemHealth(): SystemHealth {
  return {
    backend: {
      status: "ok",
      service: "aivor-backend",
      timestamp: new Date(0).toISOString()
    },
    database: {
      status: "not_configured",
      latencyMs: null
    },
    rpc: {
      status: "not_configured",
      chainId: null
    },
    governance: {
      status: "ok"
    },
    allocator: {
      status: "not_configured",
      allocatorAddress: null,
      chainId: null,
      readOnly: true,
      noCapital: true,
      noSupply: true
    }
  };
}

export async function getSystemHealthFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<SystemHealth> {
  return getApiData<SystemHealth>(`${apiBaseUrl}/health`, getSystemHealth());
}

export function getMorphoMarketsOverview(): MorphoMarketsOverview {
  return {
    mode: "read_only",
    dataSource: "fallback",
    lastUpdatedAt: null,
    criteria: {
      allowedLoanAssets: ["USDC"],
      minLiquidityAssets: "100000000000",
      minSupplyApyBps: 50,
      maxSupplyApyBps: 1500,
      maxUtilizationBps: 9000,
      maxLltvBps: 8600,
      maxRiskScoreBps: 2500,
      requiresTrustedOracle: true,
      requiresGovernanceApproval: true
    },
    markets: [],
    custody: {
      backendCustodiesFunds: false,
      readOnly: true,
      noSupplyExecuted: true,
      finalFinancialSource: "blockchain"
    }
  };
}

export function getAllocatorStatus(): AllocatorStatus {
  return {
    status: "not_configured",
    allocatorAddress: null,
    chainId: null,
    totalAssets: "0",
    liquidAssets: "0",
    exposureUsed: "0",
    exposureLimit: "0",
    totalExposureLimit: "0",
    exposureBps: 0,
    protocolEnabled: false,
    marketEnabled: false,
    isHealthy: false,
    stale: true,
    lastRiskUpdate: null,
    flags: {
      readOnly: true,
      noCapital: true,
      noSupply: true,
      backendCustodiesFunds: false
    }
  };
}

export function getAllocatorReadiness(): AllocatorReadiness {
  return {
    status: "NOT_READY",
    productionStatus: "NOT_READY",
    devValidationStatus: "NOT_READY",
    mode: "activation_preparation",
    generatedAt: new Date(0).toISOString(),
    allocatorAddress: null,
    checks: [],
    production: {
      productionReadySafe: false,
      timelockConfigured: false,
      freshnessReady: false,
      readyForPublicLaunch: false
    },
    devValidation: {
      devSafeAccepted: false,
      policyMismatchExpected: false,
      readyForNextPreparation: false,
      readyForCapitalMovement: false,
      reason: "Allocator readiness has not been loaded from the backend."
    },
    capitalValidation: {
      status: "NOT_READY",
      proposedCapitalOptions: ["1000000", "5000000", "10000000"],
      recommendedInitialCapital: "1000000",
      maxCapital: "10000000",
      exposureLimit: "0",
      rollbackReady: false,
      proposalPrepared: false,
      successCriteria: [],
      failureCriteria: [],
      readyForFirstUsdc: false
    },
    morphoPath: {
      status: "BLOCKED",
      vaultConnectedToAllocator: false,
      allocatorConnectedToVault: false,
      allocatorConnectedToController: false,
      controllerCanOperateAllocator: false,
      operationalPathComplete: false,
      recommendedOption: "new_vault_and_controller",
      diagnosis: "Morpho path has not been loaded from the backend.",
      v2DeployReady: false,
      v2NonceSafe: false,
      v2DryRunPassed: false,
      v2NoCapitalMovement: true,
      v2ReadyForBroadcast: false,
      activationSimulationPassed: false,
      sets: [
        {
          name: "V1 idle-only set",
          status: "BLOCKED",
          vaultAddress: null,
          controllerAddress: null,
          allocatorAddress: null,
          pathComplete: false,
          note: "Legacy validation set is idle-only and cannot complete the Morpho path."
        },
        {
          name: "V2 morpho-controlled set",
          status: "NOT_READY",
          vaultAddress: null,
          controllerAddress: null,
          allocatorAddress: null,
          pathComplete: false,
          note: "V2 readiness has not been loaded from the backend."
        }
      ]
    },
    activation: {
      protocolEnablePrepared: false,
      marketEnablePrepared: false,
      capitalMovementPrepared: false,
      realExecutionEnabled: false
    },
    exposure: {
      maxMarketExposure: "0",
      maxTotalExposure: "0",
      initialCapitalLimit: "0",
      idleLiquidityMinBps: 200,
      idleLiquidityTargetBps: 500,
      idleLiquidityMaxBps: 700
    },
    custody: {
      backendCustodiesFunds: false,
      noSupplyExecuted: true,
      noWithdrawExecuted: true,
      finalFinancialSource: "blockchain"
    }
  };
}

export async function getAllocatorStatusFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<AllocatorStatus> {
  return getApiData<AllocatorStatus>(
    `${apiBaseUrl}/allocator/status`,
    getAllocatorStatus()
  );
}

export async function getAllocatorReadinessFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<AllocatorReadiness> {
  return getApiData<AllocatorReadiness>(
    `${apiBaseUrl}/allocator/readiness`,
    getAllocatorReadiness()
  );
}

export function getMorphoSimulationOverview(): MorphoSimulationOverview {
  return {
    mode: "simulated",
    status: "idle",
    totalAssets: "0",
    totalSupply: "0",
    sharePrice: "1000000",
    idleAssets: "0",
    allocatedAssets: "0",
    simulatedYieldAssets: "0",
    simulatedLossAssets: "0",
    exposureBps: 0,
    maxExposureBps: 7000,
    stale: false,
    lastUpdatedAt: null,
    positions: [],
    recentEvents: [],
    custody: {
      backendCustodiesFunds: false,
      simulatedOnly: true,
      noSupplyExecuted: true,
      finalFinancialSource: "blockchain"
    }
  };
}

export async function getMorphoMarketsFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<MorphoMarketsOverview> {
  return getApiData<MorphoMarketsOverview>(
    `${apiBaseUrl}/morpho/markets`,
    getMorphoMarketsOverview()
  );
}

export async function getMorphoSimulationFromApi(
  apiBaseUrl = defaultApiBaseUrl
): Promise<MorphoSimulationOverview> {
  return getApiData<MorphoSimulationOverview>(
    `${apiBaseUrl}/morpho/simulation`,
    getMorphoSimulationOverview()
  );
}

async function getJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) return fallback;

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function getApiData<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) return fallback;

    const payload = (await response.json()) as { data?: T };
    return payload.data ?? fallback;
  } catch {
    return fallback;
  }
}
