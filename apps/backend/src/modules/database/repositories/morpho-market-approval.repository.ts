import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty } from "../database.validation";

export type MorphoMarketApprovalStatus = "watchlist" | "eligible" | "disabled" | "rejected";

export interface MorphoMarketApprovalRow {
  market_id: string;
  status: MorphoMarketApprovalStatus;
  reason: string;
  updated_by: string | null;
  updated_at: Date;
  metadata: Record<string, unknown>;
}

@Injectable()
export class MorphoMarketApprovalRepository {
  constructor(private readonly database: DatabaseService) {}

  async list() {
    const result = await this.database.query<MorphoMarketApprovalRow>(
      "SELECT * FROM morpho_market_approvals ORDER BY updated_at DESC"
    );
    return result.rows;
  }

  async findByMarketId(marketId: string) {
    requireNonEmpty(marketId, "marketId");

    const result = await this.database.query<MorphoMarketApprovalRow>(
      "SELECT * FROM morpho_market_approvals WHERE market_id = $1",
      [marketId]
    );

    return result.rows[0] ?? null;
  }

  async upsert(input: {
    marketId: string;
    status: MorphoMarketApprovalStatus;
    reason: string;
    updatedBy: string;
    metadata?: Record<string, unknown>;
  }) {
    requireNonEmpty(input.marketId, "marketId");
    requireNonEmpty(input.reason, "reason");
    requireNonEmpty(input.updatedBy, "updatedBy");

    const result = await this.database.query<MorphoMarketApprovalRow>(
      `
        INSERT INTO morpho_market_approvals (
          market_id,
          status,
          reason,
          updated_by,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (market_id)
        DO UPDATE SET
          status = EXCLUDED.status,
          reason = EXCLUDED.reason,
          updated_by = EXCLUDED.updated_by,
          metadata = EXCLUDED.metadata,
          updated_at = now()
        RETURNING *
      `,
      [
        input.marketId,
        input.status,
        input.reason,
        input.updatedBy,
        input.metadata ?? {}
      ]
    );

    return result.rows[0];
  }
}
