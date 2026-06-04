import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty, validateTxHash } from "../database.validation";

export type AdminRecordStatus = "draft" | "queued" | "executed" | "failed" | "cancelled";

export interface AdminRecordInput {
  action: string;
  status: AdminRecordStatus;
  requestedBy?: string | null;
  approvedBy?: string[];
  safeTxHash?: string | null;
  timelockOperationId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminRecordRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: AdminRecordInput) {
    requireNonEmpty(input.action, "action");
    validateTxHash(input.safeTxHash);

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO admin_records (
          action,
          status,
          requested_by,
          approved_by,
          safe_tx_hash,
          timelock_operation_id,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        input.action,
        input.status,
        input.requestedBy ?? null,
        input.approvedBy ?? [],
        input.safeTxHash ?? null,
        input.timelockOperationId ?? null,
        input.metadata ?? {}
      ]
    );

    return result.rows[0];
  }
}
