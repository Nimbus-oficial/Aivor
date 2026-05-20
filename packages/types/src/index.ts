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
