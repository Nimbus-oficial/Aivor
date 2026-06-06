import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty, validateWalletAddress } from "../database.validation";
import type {
  GovernanceProposalStatus,
  GovernanceProposalType
} from "../types/database.types";

export interface CreateGovernanceProposalInput {
  type: GovernanceProposalType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  createdBy: string;
  reason?: string | null;
  safeAddress?: string | null;
  safeChainId?: number | null;
  timelockAddress?: string | null;
}

export interface UpdateGovernanceProposalInput {
  status: GovernanceProposalStatus;
  actorUserId: string;
  reason?: string | null;
  timelockOperationId?: string | null;
}

export interface GovernanceProposalRow {
  id: string;
  type: GovernanceProposalType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: GovernanceProposalStatus;
  created_by: string | null;
  approved_by: string[];
  rejected_by: string | null;
  cancelled_by: string | null;
  queued_by: string | null;
  executed_by: string | null;
  reason: string | null;
  safe_address: string | null;
  safe_chain_id: number | null;
  timelock_address: string | null;
  safe_tx_hash: string | null;
  timelock_operation_id: string | null;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
  rejected_at: Date | null;
  cancelled_at: Date | null;
  ready_at: Date | null;
  queued_at: Date | null;
  executed_at: Date | null;
}

@Injectable()
export class GovernanceProposalRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateGovernanceProposalInput) {
    requireNonEmpty(input.title, "title");
    requireNonEmpty(input.description, "description");
    requireNonEmpty(input.createdBy, "createdBy");
    validateWalletAddress(input.safeAddress);
    validateWalletAddress(input.timelockAddress);

    const result = await this.database.query<GovernanceProposalRow>(
      `
        INSERT INTO governance_proposals (
          type,
          title,
          description,
          payload,
          created_by,
          reason,
          safe_address,
          safe_chain_id,
          timelock_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.type,
        input.title,
        input.description,
        input.payload ?? {},
        input.createdBy,
        input.reason ?? null,
        input.safeAddress ?? null,
        input.safeChainId ?? null,
        input.timelockAddress ?? null
      ]
    );

    return result.rows[0];
  }

  async list(status?: GovernanceProposalStatus) {
    const result = await this.database.query<GovernanceProposalRow>(
      `
        SELECT *
        FROM governance_proposals
        WHERE ($1::text IS NULL OR status = $1)
        ORDER BY created_at DESC
      `,
      [status ?? null]
    );

    return result.rows;
  }

  async findById(id: string) {
    requireNonEmpty(id, "proposalId");

    const result = await this.database.query<GovernanceProposalRow>(
      `
        SELECT *
        FROM governance_proposals
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async approve(id: string, input: UpdateGovernanceProposalInput) {
    return this.updateAction(
      id,
      input,
      `
        UPDATE governance_proposals
        SET status = $2,
            approved_by = array_append(approved_by, $3::uuid),
            approved_at = now(),
            ready_at = CASE WHEN $2 = 'ready' THEN now() ELSE ready_at END,
            timelock_operation_id = COALESCE($5, timelock_operation_id),
            reason = COALESCE($4, reason),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `
    );
  }

  async reject(id: string, input: UpdateGovernanceProposalInput) {
    return this.updateAction(
      id,
      input,
      `
        UPDATE governance_proposals
        SET status = $2,
            rejected_by = $3,
            rejected_at = now(),
            timelock_operation_id = COALESCE($5, timelock_operation_id),
            reason = COALESCE($4, reason),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `
    );
  }

  async cancel(id: string, input: UpdateGovernanceProposalInput) {
    return this.updateAction(
      id,
      input,
      `
        UPDATE governance_proposals
        SET status = $2,
            cancelled_by = $3,
            cancelled_at = now(),
            timelock_operation_id = COALESCE($5, timelock_operation_id),
            reason = COALESCE($4, reason),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `
    );
  }

  async queue(id: string, input: UpdateGovernanceProposalInput) {
    return this.updateAction(
      id,
      input,
      `
        UPDATE governance_proposals
        SET status = $2,
            queued_by = $3,
            queued_at = now(),
            timelock_operation_id = COALESCE($5, timelock_operation_id),
            reason = COALESCE($4, reason),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `
    );
  }

  async executeSimulated(id: string, input: UpdateGovernanceProposalInput) {
    return this.updateAction(
      id,
      input,
      `
        UPDATE governance_proposals
        SET status = $2,
            executed_by = $3,
            executed_at = now(),
            timelock_operation_id = COALESCE($5, timelock_operation_id),
            reason = COALESCE($4, reason),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `
    );
  }

  private async updateAction(
    id: string,
    input: UpdateGovernanceProposalInput,
    sql: string
  ) {
    requireNonEmpty(id, "proposalId");
    requireNonEmpty(input.actorUserId, "actorUserId");

    const result = await this.database.query<GovernanceProposalRow>(sql, [
      id,
      input.status,
      input.actorUserId,
      input.reason ?? null,
      input.timelockOperationId ?? null
    ]);

    return result.rows[0] ?? null;
  }
}
