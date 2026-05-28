import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { getUserGameStats, recordGameResult } from "./gameStats.js"

describe("recordGameResult", () => {
	it("records the first result for a challenge", async () => {
		const calls = []
		const inserted = await recordGameResult(
			{
				userId: 12,
				challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
				mode: "translate",
				difficulty: "medium",
				correct: true,
			},
			{
				query: async (sql, params) => {
					calls.push({ sql, params })
					return { rowCount: 1 }
				},
			},
		)

		assert.equal(inserted, true)
		assert.equal(calls.length, 1)
		assert.match(calls[0].sql, /ON CONFLICT/)
		assert.deepEqual(calls[0].params, [
			12,
			"1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
			"translate",
			"medium",
			true,
		])
	})

	it("ignores duplicate results for the same challenge", async () => {
		const inserted = await recordGameResult(
			{
				userId: 12,
				challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
				mode: "particles",
				correct: false,
			},
			{
				query: async () => ({ rowCount: 0 }),
			},
		)

		assert.equal(inserted, false)
	})
})

describe("getUserGameStats", () => {
	it("returns aggregate totals and zero-filled game rows", async () => {
		const stats = await getUserGameStats(12, {
			query: async (sql, params) => {
				assert.match(sql, /FROM user_game_results/)
				assert.deepEqual(params, [12])
				return {
					rows: [
						{
							mode: "translate",
							difficulty: "easy",
							total_games: "2",
							won: "1",
							failed: "1",
						},
						{
							mode: "translate",
							difficulty: "medium",
							total_games: "1",
							won: "1",
							failed: "0",
						},
						{
							mode: "particles",
							difficulty: "hard",
							total_games: "1",
							won: "0",
							failed: "1",
						},
						{
							mode: "reorder",
							difficulty: null,
							total_games: "1",
							won: "1",
							failed: "0",
						},
					],
				}
			},
		})

		assert.deepEqual(stats.total, {
			totalGames: 5,
			won: 3,
			failed: 2,
			accuracy: 60,
		})
		assert.deepEqual(stats.games, [
			{
				mode: "translate",
				label: "Translate",
				totalGames: 3,
				won: 2,
				failed: 1,
				accuracy: 67,
			},
			{
				mode: "conjugations",
				label: "Conjugations",
				totalGames: 0,
				won: 0,
				failed: 0,
				accuracy: 0,
			},
			{
				mode: "fix sentence",
				label: "Fix sentence",
				totalGames: 0,
				won: 0,
				failed: 0,
				accuracy: 0,
			},
			{
				mode: "particles",
				label: "Particles",
				totalGames: 1,
				won: 0,
				failed: 1,
				accuracy: 0,
			},
			{
				mode: "reorder",
				label: "Reorder",
				totalGames: 1,
				won: 1,
				failed: 0,
				accuracy: 100,
			},
		])
		assert.deepEqual(stats.byDifficulty.easy.total, {
			totalGames: 2,
			won: 1,
			failed: 1,
			accuracy: 50,
		})
		assert.deepEqual(stats.byDifficulty.medium.total, {
			totalGames: 1,
			won: 1,
			failed: 0,
			accuracy: 100,
		})
		assert.deepEqual(stats.byDifficulty.hard.total, {
			totalGames: 1,
			won: 0,
			failed: 1,
			accuracy: 0,
		})
		assert.deepEqual(
			stats.byDifficulty.easy.games.map(({ mode, totalGames }) => ({ mode, totalGames })),
			[
				{ mode: "translate", totalGames: 2 },
				{ mode: "conjugations", totalGames: 0 },
				{ mode: "fix sentence", totalGames: 0 },
				{ mode: "particles", totalGames: 0 },
				{ mode: "reorder", totalGames: 0 },
			],
		)
	})
})
