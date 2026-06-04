import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty, validateWalletAddress } from "../database.validation";
import type { UserRole } from "../types/database.types";

export interface UpsertUserInput {
  externalAuthSubject?: string | null;
  displayName?: string | null;
  email?: string | null;
  locale?: string;
  role?: UserRole;
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
    const result = await this.database.query<{
      id: string;
      external_auth_subject: string | null;
      display_name: string | null;
      email: string | null;
      role: UserRole;
    }>(
      `
        INSERT INTO users (
          external_auth_subject,
          display_name,
          email,
          locale,
          role
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (external_auth_subject)
        DO UPDATE SET
          display_name = COALESCE(EXCLUDED.display_name, users.display_name),
          email = COALESCE(EXCLUDED.email, users.email),
          locale = EXCLUDED.locale,
          updated_at = now()
        RETURNING id, external_auth_subject, display_name, email, role
      `,
      [
        input.externalAuthSubject ?? null,
        input.displayName ?? null,
        input.email ?? null,
        input.locale ?? "pt-BR",
        input.role ?? "user"
      ]
    );

    return result.rows[0];
  }

  async findById(userId: string) {
    requireNonEmpty(userId, "userId");

    const result = await this.database.query<{
      id: string;
      external_auth_subject: string | null;
      display_name: string | null;
      email: string | null;
      locale: string;
      role: UserRole;
      status: string;
    }>(
      `
        SELECT id, external_auth_subject, display_name, email, locale, role, status
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    return result.rows[0] ?? null;
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

  async listWallets(userId: string) {
    requireNonEmpty(userId, "userId");

    const result = await this.database.query<{
      id: string;
      address: string;
      chain_id: number;
      label: string | null;
      is_primary: boolean;
      verified_at: Date | null;
    }>(
      `
        SELECT id, address, chain_id, label, is_primary, verified_at
        FROM wallets
        WHERE user_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `,
      [userId]
    );

    return result.rows;
  }
}
