CREATE TABLE IF NOT EXISTS user_game_results (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	challenge_id UUID NOT NULL,
	mode TEXT NOT NULL,
	difficulty TEXT NOT NULL DEFAULT 'easy',
	correct BOOLEAN NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT user_game_results_mode_check
		CHECK (mode IN ('translate', 'conjugations', 'fix sentence', 'particles', 'reorder')),
	CONSTRAINT user_game_results_difficulty_check
		CHECK (difficulty IN ('easy', 'medium', 'hard')),
	CONSTRAINT user_game_results_user_challenge_unique
		UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS user_game_results_user_created_at_idx
ON user_game_results (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_game_results_user_mode_idx
ON user_game_results (user_id, mode);

CREATE INDEX IF NOT EXISTS user_game_results_user_difficulty_mode_idx
ON user_game_results (user_id, difficulty, mode);
