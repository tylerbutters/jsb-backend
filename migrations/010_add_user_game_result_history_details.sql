ALTER TABLE user_game_results
ADD COLUMN IF NOT EXISTS prompt TEXT;

ALTER TABLE user_game_results
ADD COLUMN IF NOT EXISTS answer TEXT;

ALTER TABLE user_game_results
ADD COLUMN IF NOT EXISTS feedback TEXT;
