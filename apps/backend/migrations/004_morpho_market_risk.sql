-- Aivor Morpho market approval and risk history.
-- Stores read-only market governance state and operational risk snapshots.
-- The backend does not supply to Morpho, sign transactions, or custody funds.

CREATE TABLE IF NOT EXISTS morpho_market_approvals (
  market_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('watchlist', 'eligible', 'disabled', 'rejected')),
  reason TEXT NOT NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS morpho_market_approvals_status_idx
  ON morpho_market_approvals(status);

CREATE TABLE IF NOT EXISTS morpho_market_risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT NOT NULL,
  supply_apy_bps INTEGER NOT NULL CHECK (supply_apy_bps >= 0),
  liquidity_assets TEXT NOT NULL,
  utilization_bps INTEGER NOT NULL CHECK (utilization_bps >= 0),
  lltv_bps INTEGER NOT NULL CHECK (lltv_bps >= 0),
  risk_score_bps INTEGER NOT NULL CHECK (risk_score_bps >= 0),
  status TEXT NOT NULL CHECK (status IN ('watchlist', 'eligible', 'disabled', 'rejected')),
  data_source TEXT NOT NULL CHECK (data_source IN ('real', 'fallback')),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS morpho_market_risk_snapshots_market_observed_idx
  ON morpho_market_risk_snapshots(market_id, observed_at DESC);
