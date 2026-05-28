import { db } from "../db.js"

export const TRACKED_GAME_MODES = [
	{ mode: "translate", label: "Translate" },
	{ mode: "conjugations", label: "Conjugations" },
	{ mode: "fix sentence", label: "Fix sentence" },
	{ mode: "particles", label: "Particles" },
	{ mode: "reorder", label: "Reorder" },
]
export const GAME_DIFFICULTIES = ["easy", "medium", "hard"]
export const GAME_STAT_FILTERS = ["all", ...GAME_DIFFICULTIES]

const trackedModeLabels = new Map(
	TRACKED_GAME_MODES.map((gameMode) => [gameMode.mode, gameMode.label]),
)
const validDifficulties = new Set(GAME_DIFFICULTIES)

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

function normalizeDifficulty(difficulty) {
	return validDifficulties.has(difficulty) ? difficulty : null
}

function createModeAccumulator() {
	return new Map(
		TRACKED_GAME_MODES.map(({ mode }) => [
			mode,
			{ totalGames: 0, won: 0, failed: 0 },
		]),
	)
}

function addStats(statsByMode, { mode, totalGames, won, failed }) {
	const stats = statsByMode.get(mode)
	if (!stats) return

	stats.totalGames += totalGames
	stats.won += won
	stats.failed += failed
}

function createStatsGroup(statsByMode) {
	const games = TRACKED_GAME_MODES.map(({ mode, label }) =>
		createStats({
			mode,
			label,
			...statsByMode.get(mode),
		}),
	)
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

export async function recordGameResult(
	{
		userId,
		challengeId,
		mode,
		difficulty = "easy",
		prompt,
		answer,
		correct,
		feedback,
	},
	{ query = (sql, params) => db.query(sql, params) } = {},
) {
	if (!trackedModeLabels.has(mode)) return false
	const recordedDifficulty = difficulty || "easy"
	if (!validDifficulties.has(recordedDifficulty)) return false

	const result = await query(
		`
		INSERT INTO user_game_results (
			user_id,
			challenge_id,
			mode,
			difficulty,
			prompt,
			answer,
			correct,
			feedback
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id, challenge_id) DO NOTHING
		`,
		[
			userId,
			challengeId,
			mode,
			recordedDifficulty,
			prompt || null,
			answer || null,
			Boolean(correct),
			feedback || null,
		],
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
			difficulty,
			COUNT(*) AS total_games,
			COUNT(*) FILTER (WHERE correct) AS won,
			COUNT(*) FILTER (WHERE NOT correct) AS failed
		FROM user_game_results
		WHERE user_id = $1
		GROUP BY mode, difficulty
		`,
		[userId],
	)
	const statsByFilter = new Map(
		GAME_STAT_FILTERS.map((difficulty) => [difficulty, createModeAccumulator()]),
	)

	for (const row of result.rows) {
		if (!trackedModeLabels.has(row.mode)) continue

		const difficulty = normalizeDifficulty(row.difficulty)
		const rowStats = {
			mode: row.mode,
			totalGames: normalizeCount(row?.total_games),
			won: normalizeCount(row?.won),
			failed: normalizeCount(row?.failed),
		}

		addStats(statsByFilter.get("all"), rowStats)
		if (difficulty) addStats(statsByFilter.get(difficulty), rowStats)
	}

	const byDifficulty = Object.fromEntries(
		GAME_STAT_FILTERS.map((difficulty) => [
			difficulty,
			createStatsGroup(statsByFilter.get(difficulty)),
		]),
	)

	return {
		...byDifficulty.all,
		byDifficulty,
	}
}

function createHistoryWhereClause({ mode, difficulty }) {
	const params = []
	const conditions = []

	function addParam(value) {
		params.push(value)
		return `$${params.length}`
	}

	conditions.push(`user_id = ${addParam(null)}`)

	if (mode && mode !== "all") {
		conditions.push(`mode = ${addParam(mode)}`)
	}

	if (difficulty && difficulty !== "all") {
		conditions.push(`difficulty = ${addParam(difficulty)}`)
	}

	return { conditions, params }
}

function normalizeHistoryItem(row) {
	const modeLabel = trackedModeLabels.get(row.mode) || row.mode

	return {
		id: Number(row.id),
		challengeId: row.challenge_id,
		mode: row.mode,
		label: modeLabel,
		difficulty: row.difficulty || null,
		prompt: row.prompt || "",
		answer: row.answer || "",
		correct: Boolean(row.correct),
		feedback: row.feedback || "",
		createdAt: row.created_at,
	}
}

export async function getUserGameHistory(
	userId,
	{ mode = "all", difficulty = "all", limit = 50, offset = 0 } = {},
	{ query = (sql, params) => db.query(sql, params) } = {},
) {
	const boundedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
	const boundedOffset = Math.max(Number(offset) || 0, 0)
	const { conditions, params } = createHistoryWhereClause({ mode, difficulty })
	params[0] = userId
	params.push(boundedLimit + 1, boundedOffset)

	const limitParam = `$${params.length - 1}`
	const offsetParam = `$${params.length}`
	const result = await query(
		`
		SELECT id,
			challenge_id,
			mode,
			difficulty,
			prompt,
			answer,
			correct,
			feedback,
			created_at
		FROM user_game_results
		WHERE ${conditions.join(" AND ")}
		ORDER BY created_at DESC, id DESC
		LIMIT ${limitParam}
		OFFSET ${offsetParam}
		`,
		params,
	)
	const rows = result.rows.slice(0, boundedLimit)

	return {
		items: rows.map(normalizeHistoryItem),
		hasMore: result.rows.length > boundedLimit,
		nextOffset:
			result.rows.length > boundedLimit ? boundedOffset + boundedLimit : null,
	}
}
