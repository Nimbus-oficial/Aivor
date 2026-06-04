-- Aivor PostgreSQL initial schema.
-- The database stores operational records only. Financial ownership and asset
-- balances remain sourced from blockchain state and smart contracts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_auth_subject TEXT UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  label TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallets_address_format CHECK (address ~ '^0x[0-9a-fA-F]{40}$'),
  CONSTRAINT wallets_unique_address_chain UNIQUE (address, chain_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS wallets_one_primary_per_user
  ON wallets(user_id)
  WHERE is_primary;

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  provider TEXT,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('user', 'operation', 'governance', 'security', 'blockchain', 'system')),
  source TEXT NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_address TEXT,
  chain_id INTEGER,
  tx_hash TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'pending')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT events_wallet_format CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[0-9a-fA-F]{40}$'),
  CONSTRAINT events_tx_hash_format CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[0-9a-fA-F]{64}$')
);

CREATE INDEX IF NOT EXISTS events_category_occurred_at_idx ON events(category, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_actor_user_id_idx ON events(actor_user_id);
CREATE INDEX IF NOT EXISTS events_metadata_gin_idx ON events USING GIN (metadata);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_wallet_address TEXT,
  action TEXT NOT NULL,
  origin TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'pending')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_actor_wallet_format CHECK (
    actor_wallet_address IS NULL OR actor_wallet_address ~ '^0x[0-9a-fA-F]{40}$'
  )
);

CREATE INDEX IF NOT EXISTS audit_logs_action_occurred_at_idx ON audit_logs(action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_user_id_idx ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_metadata_gin_idx ON audit_logs USING GIN (metadata);

CREATE TABLE IF NOT EXISTS operational_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'queued', 'executed', 'failed', 'cancelled')),
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID[] NOT NULL DEFAULT ARRAY[]::uuid[],
  safe_tx_hash TEXT,
  timelock_operation_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  CONSTRAINT admin_records_safe_tx_hash_format CHECK (
    safe_tx_hash IS NULL OR safe_tx_hash ~ '^0x[0-9a-fA-F]{64}$'
  )
);

CREATE INDEX IF NOT EXISTS admin_records_status_requested_at_idx ON admin_records(status, requested_at DESC);
CREATE INDEX IF NOT EXISTS admin_records_action_idx ON admin_records(action);

CREATE TABLE IF NOT EXISTS position_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT,
  asset_symbol TEXT NOT NULL CHECK (asset_symbol IN ('USDC', 'EURC', 'ovUSDC')),
  chain_id INTEGER NOT NULL,
  vault_address TEXT,
  share_balance NUMERIC(38, 0) NOT NULL DEFAULT 0 CHECK (share_balance >= 0),
  asset_value NUMERIC(38, 0) NOT NULL DEFAULT 0 CHECK (asset_value >= 0),
  share_price NUMERIC(38, 0) NOT NULL DEFAULT 0 CHECK (share_price >= 0),
  source TEXT NOT NULL DEFAULT 'blockchain',
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT position_snapshots_wallet_format CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[0-9a-fA-F]{40}$'),
  CONSTRAINT position_snapshots_vault_format CHECK (vault_address IS NULL OR vault_address ~ '^0x[0-9a-fA-F]{40}$'),
  CONSTRAINT position_snapshots_source_check CHECK (source IN ('blockchain', 'indexer', 'manual_reconciliation'))
);

CREATE INDEX IF NOT EXISTS position_snapshots_user_observed_at_idx ON position_snapshots(user_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS position_snapshots_wallet_observed_at_idx ON position_snapshots(wallet_address, observed_at DESC);

INSERT INTO operational_settings (key, value, description)
VALUES
  ('liquidity_policy', '{"minBps":200,"targetBps":500,"maxBps":700}'::jsonb, 'Official idle liquidity policy: 2% minimum, 5% target, 7% maximum.'),
  ('governance_policy', '{"multisig":"Safe 2-of-4","timelockRequired":true,"emergencyPauseAllowed":true}'::jsonb, 'Official governance policy for critical administrative actions.'),
  ('supported_assets', '["USDC","EURC"]'::jsonb, 'Approved assets. EURC technical implementation is planned after USDC testnet.'),
  ('enabled_protocols', '["Morpho"]'::jsonb, 'Protocols enabled in the initial technical scope. Aave, Aerodrome and Uniswap remain future phases.'),
  ('share_token', '{"name":"Orvex Yield USDC","ticker":"ovUSDC","model":"ERC4626 yield-bearing share","rebasing":false}'::jsonb, 'Official non-rebasing ERC4626 share token metadata.')
ON CONFLICT (key) DO NOTHING;
