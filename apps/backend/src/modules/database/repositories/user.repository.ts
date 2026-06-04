import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty, validateWalletAddress } from "../database.validation";

export interface UpsertUserInput {
  externalAuthSubject?: string | null;
  displayName?: string | null;
  email?: string | null;
  locale?: string;
}

export interface WalletInput {
  userId: string;
  address: string;
  chainId: number;
  label?: string | null;
  isPrimary?: boolean;
}

@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async upsertUser(input: UpsertUserInput) {
    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO users (
          external_auth_subject,
          display_name,
          email,
          locale
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (external_auth_subject)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          email = EXCLUDED.email,
          locale = EXCLUDED.locale,
          updated_at = now()
        RETURNING id
      `,
      [
        input.externalAuthSubject ?? null,
        input.displayName ?? null,
        input.email ?? null,
        input.locale ?? "pt-BR"
      ]
    );

    return result.rows[0];
  }

  async addWallet(input: WalletInput) {
    requireNonEmpty(input.userId, "userId");
    validateWalletAddress(input.address);

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO wallets (
          user_id,
          address,
          chain_id,
          label,
          is_primary,
          verified_at
        )
        VALUES ($1, $2, $3, $4, $5, now())
        ON CONFLICT (address, chain_id)
        DO UPDATE SET
          user_id = EXCLUDED.user_id,
          label = EXCLUDED.label,
          is_primary = EXCLUDED.is_primary,
          verified_at = now(),
          updated_at = now()
        RETURNING id
      `,
      [
        input.userId,
        input.address,
        input.chainId,
        input.label ?? null,
        input.isPrimary ?? false
      ]
    );

    return result.rows[0];
  }
}
