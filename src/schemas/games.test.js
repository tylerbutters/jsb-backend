import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { gameCheckSchema } from "./games.js"

describe("gameCheckSchema", () => {
	it("accepts an optional challenge ID", () => {
		const { error, value } = gameCheckSchema.validate({
			mode: "translate",
			difficulty: "medium",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
			challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
		})

		assert.equal(error, undefined)
		assert.equal(value.difficulty, "medium")
		assert.equal(value.challengeId, "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95")
	})

	it("defaults difficulty to easy", () => {
		const { error, value } = gameCheckSchema.validate({
			mode: "translate",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
		})

		assert.equal(error, undefined)
		assert.equal(value.difficulty, "easy")
	})

	it("rejects invalid challenge IDs", () => {
		const { error } = gameCheckSchema.validate({
			mode: "translate",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
			challengeId: "not-a-uuid",
		})

		assert.equal(error?.details[0].message, "Challenge ID must be a valid UUID")
	})

	it("rejects invalid difficulty", () => {
		const { error } = gameCheckSchema.validate({
			mode: "translate",
			difficulty: "expert",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
		})

		assert.equal(error?.details[0].message, "Difficulty must be easy, medium, or hard")
	})
})
