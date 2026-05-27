ALTER TABLE users
ADD COLUMN pending_email TEXT,
ADD COLUMN pending_email_token_hash TEXT,
ADD COLUMN pending_email_requested_at TIMESTAMPTZ,
ADD COLUMN pending_email_expires_at TIMESTAMPTZ;