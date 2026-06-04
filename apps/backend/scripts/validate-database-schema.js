const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

const migration = fs.readFileSync(
  path.join(__dirname, "..", "migrations", "001_initial_schema.sql"),
  "utf8"
);

const requiredTables = [
  "schema_migrations",
  "users",
  "wallets",
  "sessions",
  "events",
  "audit_logs",
  "operational_settings",
  "admin_records",
  "position_snapshots"
];

for (const table of requiredTables) {
  assert(
    migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
    `Missing table ${table}`
  );
}

assert(migration.includes('"minBps":200'), "Missing official 2% liquidity minimum");
assert(migration.includes('"targetBps":500'), "Missing official 5% liquidity target");
assert(migration.includes('"maxBps":700'), "Missing official 7% liquidity maximum");
assert(migration.includes('"Safe 2-of-4"'), "Missing official Safe 2-of-4 policy");
assert(migration.includes('"USDC","EURC"'), "Missing approved supported assets");
assert(migration.includes('"Morpho"'), "Missing initial Morpho protocol setting");
assert(
  migration.includes("Financial ownership and asset") ||
    migration.includes("blockchain state and smart contracts"),
  "Missing non-custody schema note"
);

console.log("Database schema validation passed.");
