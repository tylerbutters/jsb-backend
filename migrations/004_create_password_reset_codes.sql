CREATE TABLE IF NOT EXISTS password_reset_codes (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	code_hash TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	used_at TIMESTAMPTZ,
	attempt_count INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_codes_user_active_idx
ON password_reset_codes (user_id, expires_at)
WHERE used_at IS NULL;
