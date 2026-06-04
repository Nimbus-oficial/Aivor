import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database.service";
import { requireNonEmpty } from "../database.validation";

export interface SessionInput {
  userId?: string | null;
  sessionHash: string;
  provider?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: SessionInput) {
    requireNonEmpty(input.sessionHash, "sessionHash");

    const result = await this.database.query<{
      id: string;
      user_id: string | null;
      session_hash: string;
      provider: string | null;
      expires_at: Date;
      revoked_at: Date | null;
    }>(
      `
        INSERT INTO sessions (
          user_id,
          session_hash,
          provider,
          ip_address,
          user_agent,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, session_hash, provider, expires_at, revoked_at
      `,
      [
        input.userId ?? null,
        input.sessionHash,
        input.provider ?? null,
        input.ipAddress ?? null,
        input.userAgent ?? null,
        input.expiresAt
      ]
    );

    return result.rows[0];
  }

  async revoke(sessionHash: string) {
    requireNonEmpty(sessionHash, "sessionHash");

    const result = await this.database.query<{ id: string }>(
      `
        UPDATE sessions
        SET revoked_at = now()
        WHERE session_hash = $1
        RETURNING id
      `,
      [sessionHash]
    );

    return result.rows[0] ?? null;
  }

  async findActive(sessionHash: string) {
    requireNonEmpty(sessionHash, "sessionHash");

    const result = await this.database.query<{
      id: string;
      user_id: string | null;
      session_hash: string;
      provider: string | null;
      expires_at: Date;
      revoked_at: Date | null;
    }>(
      `
        SELECT id, user_id, session_hash, provider, expires_at, revoked_at
        FROM sessions
        WHERE session_hash = $1
          AND revoked_at IS NULL
          AND expires_at > now()
      `,
      [sessionHash]
    );

    return result.rows[0] ?? null;
  }
}
