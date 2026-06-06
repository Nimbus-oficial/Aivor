import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty } from "../database.validation";
import type { MorphoMarketApprovalStatus } from "./morpho-market-approval.repository";

export interface MorphoRiskSnapshotRow {
  id: string;
  market_id: string;
  supply_apy_bps: number;
  liquidity_assets: string;
  utilization_bps: number;
  lltv_bps: number;
  risk_score_bps: number;
  status: MorphoMarketApprovalStatus;
  data_source: "real" | "fallback";
  observed_at: Date;
  metadata: Record<string, unknown>;
}

@Injectable()
export class MorphoRiskSnapshotRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: {
    marketId: string;
    supplyApyBps: number;
    liquidityAssets: string;
    utilizationBps: number;
    lltvBps: number;
    riskScoreBps: number;
    status: MorphoMarketApprovalStatus;
    dataSource: "real" | "fallback";
    metadata?: Record<string, unknown>;
  }) {
    requireNonEmpty(input.marketId, "marketId");

    const result = await this.database.query<MorphoRiskSnapshotRow>(
      `
        INSERT INTO morpho_market_risk_snapshots (
          market_id,
          supply_apy_bps,
          liquidity_assets,
          utilization_bps,
          lltv_bps,
          risk_score_bps,
          status,
          data_source,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.marketId,
        input.supplyApyBps,
        input.liquidityAssets,
        input.utilizationBps,
        input.lltvBps,
        input.riskScoreBps,
        input.status,
        input.dataSource,
        input.metadata ?? {}
      ]
    );

    return result.rows[0];
  }

  async listByMarketId(marketId: string, limit = 20) {
    requireNonEmpty(marketId, "marketId");

    const result = await this.database.query<MorphoRiskSnapshotRow>(
      `
        SELECT *
        FROM morpho_market_risk_snapshots
        WHERE market_id = $1
        ORDER BY observed_at DESC
        LIMIT $2
      `,
      [marketId, limit]
    );

    return result.rows;
  }
}
