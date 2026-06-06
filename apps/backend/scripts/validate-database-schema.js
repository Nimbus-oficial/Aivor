const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

const migration = fs.readFileSync(
  path.join(__dirname, "..", "migrations", "001_initial_schema.sql"),
  "utf8"
);
const governanceMigration = fs.readFileSync(
  path.join(__dirname, "..", "migrations", "003_governance_proposals.sql"),
  "utf8"
);
const morphoMigration = fs.readFileSync(
  path.join(__dirname, "..", "migrations", "004_morpho_market_risk.sql"),
  "utf8"
);
const morphoController = fs.readFileSync(
  path.join(__dirname, "..", "src", "modules", "morpho", "morpho.controller.ts"),
  "utf8"
);
const morphoService = fs.readFileSync(
  path.join(__dirname, "..", "src", "modules", "morpho", "morpho.service.ts"),
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
assert(
  governanceMigration.includes("CREATE TABLE IF NOT EXISTS governance_proposals"),
  "Missing governance proposals table"
);
assert(
  governanceMigration.includes("'executed_simulated'"),
  "Missing simulated execution status"
);
assert(
  governanceMigration.includes("backend does not sign or move funds"),
  "Missing governance non-custody note"
);
assert(
  morphoMigration.includes("CREATE TABLE IF NOT EXISTS morpho_market_approvals"),
  "Missing Morpho market approvals table"
);
assert(
  morphoMigration.includes("CREATE TABLE IF NOT EXISTS morpho_market_risk_snapshots"),
  "Missing Morpho market risk snapshots table"
);
assert(
  morphoMigration.includes("The backend does not supply to Morpho"),
  "Missing Morpho non-custody note"
);
assert(
  morphoController.includes('@Get("simulation")') &&
    morphoController.includes('@Post("simulation/allocation")') &&
    morphoController.includes('@Post("simulation/rebalance")'),
  "Missing Morpho simulation endpoints"
);
assert(
  morphoService.includes("morpho.simulation.started") &&
    morphoService.includes("morpho.simulation.completed") &&
    morphoService.includes("morpho.simulation.failed") &&
    morphoService.includes("morpho.simulated_allocation") &&
    morphoService.includes("morpho.simulated_rebalance"),
  "Missing Morpho simulation audit actions"
);
assert(
  morphoService.includes("noFundsMoved") &&
    morphoService.includes("simulatedOnly") &&
    morphoService.includes("noSupplyExecuted"),
  "Missing Morpho simulated non-custody markers"
);

console.log("Database schema validation passed.");
