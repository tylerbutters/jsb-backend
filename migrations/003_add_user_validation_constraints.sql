UPDATE users
SET display_name = left(email, 80)
WHERE display_name IS NULL OR trim(display_name) = '';

ALTER TABLE users
ALTER COLUMN display_name SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT users_email_length_check
CHECK (char_length(email) BETWEEN 1 AND 254);

ALTER TABLE users
ADD CONSTRAINT users_display_name_length_check
CHECK (char_length(trim(display_name)) BETWEEN 1 AND 80);

ALTER TABLE users
ADD CONSTRAINT users_password_hash_length_check
CHECK (char_length(password_hash) > 0);
