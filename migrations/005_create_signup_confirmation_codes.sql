CREATE TABLE IF NOT EXISTS signup_confirmation_codes (
	id BIGSERIAL PRIMARY KEY,
	email TEXT NOT NULL,
	display_name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	code_hash TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	used_at TIMESTAMPTZ,
	attempt_count INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signup_confirmation_codes_email_active_idx
ON signup_confirmation_codes (email, expires_at)
WHERE used_at IS NULL;
