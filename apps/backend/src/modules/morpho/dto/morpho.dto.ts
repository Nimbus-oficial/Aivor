import type { MorphoMarketApprovalStatus } from "../../database/repositories/morpho-market-approval.repository";

export interface MorphoMarketActionDto {
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface MorphoMarketStatusDto {
  status: MorphoMarketApprovalStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface MorphoSimulationActionDto {
  amountAssets?: string;
  marketId?: string;
  toMarketId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}
