import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import {
  requireNonEmpty,
  validateResult,
  validateWalletAddress
} from "../database.validation";
import type { AuditLogInput } from "../types/database.types";

@Injectable()
export class AuditRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: AuditLogInput) {
    requireNonEmpty(input.action, "action");
    requireNonEmpty(input.origin, "origin");
    requireNonEmpty(input.targetType, "targetType");
    validateResult(input.result);
    validateWalletAddress(input.actorWalletAddress);

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO audit_logs (
          actor_user_id,
          actor_wallet_address,
          action,
          origin,
          target_type,
          target_id,
          result,
          ip_address,
          user_agent,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        input.actorUserId ?? null,
        input.actorWalletAddress ?? null,
        input.action,
        input.origin,
        input.targetType,
        input.targetId ?? null,
        input.result,
        input.ipAddress ?? null,
        input.userAgent ?? null,
        input.metadata ?? {}
      ]
    );

    return result.rows[0];
  }
}
