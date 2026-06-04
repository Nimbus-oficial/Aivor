import { Injectable } from "@nestjs/common";
import { DatabaseValidationError } from "../database.errors";
import { DatabaseService } from "../database.service";
import { requireNonEmpty, validateBasisPoints } from "../database.validation";
import type { OperationalSettingInput } from "../types/database.types";

@Injectable()
export class OperationalSettingsRepository {
  constructor(private readonly database: DatabaseService) {}

  async get(key: string) {
    requireNonEmpty(key, "key");

    const result = await this.database.query<{
      key: string;
      value: Record<string, unknown> | string[];
      description: string;
      is_sensitive: boolean;
      updated_at: Date;
    }>(
      `
        SELECT key, value, description, is_sensitive, updated_at
        FROM operational_settings
        WHERE key = $1
      `,
      [key]
    );

    return result.rows[0] ?? null;
  }

  async upsert(input: OperationalSettingInput) {
    requireNonEmpty(input.key, "key");
    requireNonEmpty(input.description, "description");
    this.validateOfficialSettings(input);

    const result = await this.database.query<{ key: string }>(
      `
        INSERT INTO operational_settings (
          key,
          value,
          description,
          is_sensitive,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (key)
        DO UPDATE SET
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          is_sensitive = EXCLUDED.is_sensitive,
          updated_by = EXCLUDED.updated_by,
          updated_at = now()
        RETURNING key
      `,
      [
        input.key,
        input.value,
        input.description,
        input.isSensitive ?? false,
        input.updatedBy ?? null
      ]
    );

    return result.rows[0];
  }

  private validateOfficialSettings(input: OperationalSettingInput) {
    if (input.key !== "liquidity_policy") return;

    const value = input.value as Record<string, unknown>;
    validateBasisPoints(value.minBps, "minBps");
    validateBasisPoints(value.targetBps, "targetBps");
    validateBasisPoints(value.maxBps, "maxBps");

    if (value.minBps !== 200 || value.targetBps !== 500 || value.maxBps !== 700) {
      throw new DatabaseValidationError("liquidity policy must remain 2% / 5% / 7%");
    }
  }
}
