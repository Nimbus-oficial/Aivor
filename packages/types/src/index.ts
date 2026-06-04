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
    name: "Orvex Yield USDC";
    ticker: "ovUSDC";
    model: "erc4626-share-price";
    rebasing: false;
  };
  strategies: StrategyAllocation[];
}
