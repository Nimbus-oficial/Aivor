import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import {
  requireNonEmpty,
  validateEventCategory,
  validateResult,
  validateTxHash,
  validateWalletAddress
} from "../database.validation";
import type { EventInput } from "../types/database.types";

@Injectable()
export class EventRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: EventInput) {
    requireNonEmpty(input.eventType, "eventType");
    requireNonEmpty(input.source, "source");
    validateEventCategory(input.category);
    validateResult(input.result);
    validateWalletAddress(input.walletAddress);
    validateTxHash(input.txHash);

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO events (
          event_type,
          category,
          source,
          actor_user_id,
          wallet_address,
          chain_id,
          tx_hash,
          result,
          metadata,
          occurred_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, now()))
        RETURNING id
      `,
      [
        input.eventType,
        input.category,
        input.source,
        input.actorUserId ?? null,
        input.walletAddress ?? null,
        input.chainId ?? null,
        input.txHash ?? null,
        input.result,
        input.metadata ?? {},
        input.occurredAt ?? null
      ]
    );

    return result.rows[0];
  }
}
