CREATE TABLE IF NOT EXISTS user_sessions (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token_hash TEXT NOT NULL UNIQUE,
	expires_at TIMESTAMPTZ NOT NULL,
	revoked_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT user_sessions_token_hash_length_check
		CHECK (char_length(token_hash) = 64)
);

CREATE INDEX IF NOT EXISTS user_sessions_user_active_idx
ON user_sessions (user_id)
WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx
ON user_sessions (expires_at)
WHERE revoked_at IS NULL;
