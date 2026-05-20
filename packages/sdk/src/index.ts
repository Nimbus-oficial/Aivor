import type { AccountOverview, VaultStatus } from "@orvex/types";

export function getAccountOverview(): AccountOverview {
  return {
    balanceUsd: "US$ 12.842,60",
    earningsUsd: "US$ 342,60",
    growthLabel: "+2,74%",
    monthlyGrowth: "+US$ 42,10 este mes",
    currency: "USDC"
  };
}

export function getVaultStatus(): VaultStatus {
  return {
    depositsEnabled: true,
    withdrawalsEnabled: true,
    availableLiquidityUsd: "US$ 1.284.260,00"
  };
}
