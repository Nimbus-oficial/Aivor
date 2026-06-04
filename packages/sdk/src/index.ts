import type {
  AccountOverview,
  AdminVaultOverview,
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
      name: "Orvex Yield USDC",
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
