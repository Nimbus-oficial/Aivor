import { Injectable } from "@nestjs/common";
import { DatabaseValidationError } from "../database.errors";
import { DatabaseService } from "../database.service";
import { validateWalletAddress } from "../database.validation";
import type { PositionSnapshotInput } from "../types/database.types";

@Injectable()
export class PositionSnapshotRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: PositionSnapshotInput) {
    validateWalletAddress(input.walletAddress);
    validateWalletAddress(input.vaultAddress);
    this.validateNonNegativeIntegerString(input.shareBalance, "shareBalance");
    this.validateNonNegativeIntegerString(input.assetValue, "assetValue");
    this.validateNonNegativeIntegerString(input.sharePrice, "sharePrice");

    const result = await this.database.query<{ id: string }>(
      `
        INSERT INTO position_snapshots (
          user_id,
          wallet_address,
          asset_symbol,
          chain_id,
          vault_address,
          share_balance,
          asset_value,
          share_price,
          source,
          observed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        input.userId ?? null,
        input.walletAddress ?? null,
        input.assetSymbol,
        input.chainId,
        input.vaultAddress ?? null,
        input.shareBalance,
        input.assetValue,
        input.sharePrice,
        input.source,
        input.observedAt
      ]
    );

    return result.rows[0];
  }

  private validateNonNegativeIntegerString(value: string, field: string) {
    if (!/^\d+$/.test(value)) {
      throw new DatabaseValidationError(`${field} must be a non-negative integer string`);
    }
  }
}
