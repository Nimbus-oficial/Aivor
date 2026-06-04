const assert = require("node:assert");
const { randomUUID } = require("node:crypto");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to validate the database roundtrip.");
  process.exit(1);
}

const walletAddress = "0x1111111111111111111111111111111111111111";
const vaultAddress = "0x2222222222222222222222222222222222222222";
const txHash = `0x${"a".repeat(64)}`;

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");

    const user = await client.query(
      `
        INSERT INTO users (external_auth_subject, display_name, email, locale)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        `phase-3-1-${randomUUID()}`,
        "Cliente Aivor Teste",
        `phase-3-1-${randomUUID()}@orvex.local`,
        "pt-BR"
      ]
    );
    const userId = user.rows[0].id;
    assert(userId, "user id was not returned");

    const wallet = await client.query(
      `
        INSERT INTO wallets (user_id, address, chain_id, label, is_primary, verified_at)
        VALUES ($1, $2, $3, $4, $5, now())
        RETURNING id
      `,
      [userId, walletAddress, 8453, "Carteira principal", true]
    );
    assert(wallet.rows[0].id, "wallet id was not returned");

    const event = await client.query(
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
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
      [
        "database.roundtrip",
        "system",
        "phase-3-1-validation",
        userId,
        walletAddress,
        8453,
        txHash,
        "success",
        { scope: "database-validation" }
      ]
    );
    assert(event.rows[0].id, "event id was not returned");

    const auditLog = await client.query(
      `
        INSERT INTO audit_logs (
          actor_user_id,
          actor_wallet_address,
          action,
          origin,
          target_type,
          target_id,
          result,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [
        userId,
        walletAddress,
        "database.roundtrip",
        "phase-3-1-validation",
        "database",
        "postgresql",
        "success",
        { note: "audit base validation" }
      ]
    );
    assert(auditLog.rows[0].id, "audit log id was not returned");

    const settings = await client.query(
      `
        SELECT key, value
        FROM operational_settings
        WHERE key IN ('liquidity_policy', 'governance_policy', 'supported_assets')
        ORDER BY key
      `
    );
    assert.strictEqual(settings.rowCount, 3, "official operational settings were not seeded");

    const liquidityPolicy = settings.rows.find((row) => row.key === "liquidity_policy").value;
    assert.strictEqual(liquidityPolicy.minBps, 200, "liquidity minimum must be 2%");
    assert.strictEqual(liquidityPolicy.targetBps, 500, "liquidity target must be 5%");
    assert.strictEqual(liquidityPolicy.maxBps, 700, "liquidity maximum must be 7%");

    const snapshot = await client.query(
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
        RETURNING id, source
      `,
      [
        userId,
        walletAddress,
        "ovUSDC",
        8453,
        vaultAddress,
        "1000000000",
        "1050000000",
        "1050000",
        "blockchain"
      ]
    );
    assert(snapshot.rows[0].id, "position snapshot id was not returned");
    assert.strictEqual(
      snapshot.rows[0].source,
      "blockchain",
      "position snapshot must be an operational blockchain reading"
    );

    await client.query("ROLLBACK");
    console.log("Database roundtrip validation passed.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
