import { db } from "../db.js"

export const TRACKED_GAME_MODES = [
	{ mode: "translate", label: "Translate" },
	{ mode: "conjugations", label: "Conjugations" },
	{ mode: "fix sentence", label: "Fix sentence" },
	{ mode: "particles", label: "Particles" },
	{ mode: "reorder", label: "Reorder" },
]

const trackedModeLabels = new Map(
	TRACKED_GAME_MODES.map((gameMode) => [gameMode.mode, gameMode.label]),
)

function calculateAccuracy(won, totalGames) {
	if (!totalGames) return 0
	return Math.round((won / totalGames) * 100)
}

function createStats({ mode, label, totalGames = 0, won = 0, failed = 0 } = {}) {
	return {
		...(mode ? { mode } : {}),
		...(label ? { label } : {}),
		totalGames,
		won,
		failed,
		accuracy: calculateAccuracy(won, totalGames),
	}
}

function normalizeCount(value) {
	return Number(value || 0)
}

export async function recordGameResult(
	{ userId, challengeId, mode, correct },
	{ query = (sql, params) => db.query(sql, params) } = {},
) {
	if (!trackedModeLabels.has(mode)) return false

	const result = await query(
		`
		INSERT INTO user_game_results (user_id, challenge_id, mode, correct)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, challenge_id) DO NOTHING
		`,
		[userId, challengeId, mode, Boolean(correct)],
	)

	return result.rowCount > 0
}

export async function getUserGameStats(
	userId,
	{ query = (sql, params) => db.query(sql, params) } = {},
) {
	const result = await query(
		`
		SELECT mode,
			COUNT(*) AS total_games,
			COUNT(*) FILTER (WHERE correct) AS won,
			COUNT(*) FILTER (WHERE NOT correct) AS failed
		FROM user_game_results
		WHERE user_id = $1
		GROUP BY mode
		`,
		[userId],
	)
	const rowsByMode = new Map(result.rows.map((row) => [row.mode, row]))
	const games = TRACKED_GAME_MODES.map(({ mode, label }) => {
		const row = rowsByMode.get(mode)

		return createStats({
			mode,
			label,
			totalGames: normalizeCount(row?.total_games),
			won: normalizeCount(row?.won),
			failed: normalizeCount(row?.failed),
		})
	})
	const total = games.reduce(
		(summary, game) => ({
			totalGames: summary.totalGames + game.totalGames,
			won: summary.won + game.won,
			failed: summary.failed + game.failed,
		}),
		{ totalGames: 0, won: 0, failed: 0 },
	)

	return {
		total: createStats(total),
		games,
	}
}
