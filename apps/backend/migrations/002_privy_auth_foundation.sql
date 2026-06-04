-- Privy authentication foundation.
-- Roles are operational authorization only; Safe governance remains a later phase.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'operator', 'admin'));

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS sessions_active_idx
  ON sessions(session_hash, expires_at)
  WHERE revoked_at IS NULL;
