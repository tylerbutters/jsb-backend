ALTER TABLE user_game_results
ADD COLUMN IF NOT EXISTS difficulty TEXT;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'user_game_results_difficulty_check'
			AND conrelid = 'user_game_results'::regclass
	) THEN
		ALTER TABLE user_game_results
		ADD CONSTRAINT user_game_results_difficulty_check
		CHECK (difficulty IN ('easy', 'medium', 'hard'));
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS user_game_results_user_difficulty_mode_idx
ON user_game_results (user_id, difficulty, mode);
