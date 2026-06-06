export type MorphoMarketStatus = "eligible" | "watchlist" | "disabled" | "rejected";

export interface MorphoMarketCandidate {
  marketId: string;
  loanToken: string;
  collateralToken: string;
  oracle: string;
  irm: string;
  lltvBps: number;
  totalSupplyAssets: bigint;
  totalBorrowAssets: bigint;
  supplyApyBps: number;
  liquidityAssets: bigint;
  oracleTrusted: boolean;
  governanceApproved: boolean;
  approvalStatus?: MorphoMarketStatus;
  approvalReason?: string;
  approvalUpdatedAt?: string;
  disabled?: boolean;
  criticalFlags?: string[];
}

export interface MorphoEligibilityCriteria {
  allowedLoanAssets: string[];
  minLiquidityAssets: bigint;
  minSupplyApyBps: number;
  maxSupplyApyBps: number;
  maxUtilizationBps: number;
  maxLltvBps: number;
  maxRiskScoreBps: number;
  requiresTrustedOracle: boolean;
  requiresGovernanceApproval: boolean;
}

export function classifyMorphoMarket(
  market: MorphoMarketCandidate,
  criteria: MorphoEligibilityCriteria
) {
  const utilizationBps = calculateUtilizationBps(
    market.totalSupplyAssets,
    market.totalBorrowAssets
  );
  const criticalFlags = market.criticalFlags ?? [];
  const riskScoreBps = calculateRiskScoreBps(market, criteria, utilizationBps);
  const reasons: string[] = [];

  if (market.disabled) reasons.push("market disabled");
  if (!criteria.allowedLoanAssets.includes(market.loanToken)) {
    reasons.push("loan asset not allowed");
  }
  if (market.liquidityAssets < criteria.minLiquidityAssets) {
    reasons.push("insufficient liquidity");
  }
  if (market.supplyApyBps < criteria.minSupplyApyBps) {
    reasons.push("apy below minimum range");
  }
  if (market.supplyApyBps > criteria.maxSupplyApyBps) {
    reasons.push("apy above acceptable range");
  }
  if (utilizationBps > criteria.maxUtilizationBps) {
    reasons.push("utilization above limit");
  }
  if (market.lltvBps > criteria.maxLltvBps) {
    reasons.push("lltv above limit");
  }
  if (criteria.requiresTrustedOracle && !market.oracleTrusted) {
    reasons.push("oracle not trusted");
  }
  if (criteria.requiresGovernanceApproval && !market.governanceApproved) {
    reasons.push("not approved by governance");
  }
  if (criticalFlags.length > 0) {
    reasons.push(`critical flags: ${criticalFlags.join(", ")}`);
  }
  if (riskScoreBps > criteria.maxRiskScoreBps) {
    reasons.push("risk score above limit");
  }

  return {
    utilizationBps,
    riskScoreBps,
    status: getStatus(reasons, market, criteria) as MorphoMarketStatus,
    statusReason: reasons.length > 0 ? reasons.join("; ") : "passes minimum criteria"
  };
}

function getStatus(
  reasons: string[],
  market: MorphoMarketCandidate,
  criteria: MorphoEligibilityCriteria
) {
  if (market.disabled || (market.criticalFlags?.length ?? 0) > 0) return "disabled";
  if (!criteria.allowedLoanAssets.includes(market.loanToken)) return "rejected";
  if (!market.oracleTrusted || !market.governanceApproved) return "watchlist";
  if (reasons.length > 0) return "watchlist";
  return "eligible";
}

function calculateUtilizationBps(totalSupplyAssets: bigint, totalBorrowAssets: bigint) {
  if (totalSupplyAssets === 0n) return 0;
  return Number((totalBorrowAssets * 10_000n) / totalSupplyAssets);
}

function calculateRiskScoreBps(
  market: MorphoMarketCandidate,
  criteria: MorphoEligibilityCriteria,
  utilizationBps: number
) {
  let score = 0;
  if (!market.oracleTrusted) score += 2_500;
  if (!market.governanceApproved) score += 2_000;
  if (market.lltvBps > criteria.maxLltvBps) score += 1_500;
  if (utilizationBps > criteria.maxUtilizationBps) score += 1_500;
  if (market.supplyApyBps > criteria.maxSupplyApyBps) score += 1_000;
  score += (market.criticalFlags?.length ?? 0) * 2_000;
  return Math.min(score, 10_000);
}
