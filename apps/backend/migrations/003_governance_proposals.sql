-- Aivor governance proposal foundation.
-- This phase stores operational governance state only. Safe and Timelock
-- execution remains simulated/read-only; the backend does not sign or move funds.

CREATE TABLE IF NOT EXISTS governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (
    type IN (
      'operational_parameter_change',
      'address_update',
      'operational_pause',
      'decision_record',
      'future_onchain_transaction'
    )
  ),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'approved',
      'rejected',
      'cancelled',
      'ready',
      'queued',
      'executed_simulated'
    )
  ),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID[] NOT NULL DEFAULT ARRAY[]::uuid[],
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  queued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  safe_address TEXT,
  safe_chain_id INTEGER,
  timelock_address TEXT,
  safe_tx_hash TEXT,
  timelock_operation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  CONSTRAINT governance_proposals_safe_address_format CHECK (
    safe_address IS NULL OR safe_address ~ '^0x[0-9a-fA-F]{40}$'
  ),
  CONSTRAINT governance_proposals_timelock_address_format CHECK (
    timelock_address IS NULL OR timelock_address ~ '^0x[0-9a-fA-F]{40}$'
  ),
  CONSTRAINT governance_proposals_safe_tx_hash_format CHECK (
    safe_tx_hash IS NULL OR safe_tx_hash ~ '^0x[0-9a-fA-F]{64}$'
  )
);

CREATE INDEX IF NOT EXISTS governance_proposals_status_created_at_idx
  ON governance_proposals(status, created_at DESC);

CREATE INDEX IF NOT EXISTS governance_proposals_type_idx
  ON governance_proposals(type);

CREATE INDEX IF NOT EXISTS governance_proposals_payload_gin_idx
  ON governance_proposals USING GIN (payload);
