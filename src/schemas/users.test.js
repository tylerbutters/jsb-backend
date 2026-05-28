import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { gameHistoryQuerySchema } from "./users.js"

describe("gameHistoryQuerySchema", () => {
	it("accepts valid filters and pagination", () => {
		const { error, value } = gameHistoryQuerySchema.validate({
			mode: "translate",
			difficulty: "medium",
			limit: "25",
			offset: "50",
		})

		assert.equal(error, undefined)
		assert.deepEqual(value, {
			mode: "translate",
			difficulty: "medium",
			limit: 25,
			offset: 50,
		})
	})

	it("defaults to all history with a 50 item page", () => {
		const { error, value } = gameHistoryQuerySchema.validate({})

		assert.equal(error, undefined)
		assert.deepEqual(value, {
			mode: "all",
			difficulty: "all",
			limit: 50,
			offset: 0,
		})
	})

	it("rejects unsupported filters", () => {
		const { error } = gameHistoryQuerySchema.validate({
			mode: "sandbox",
		})

		assert.equal(error?.details[0].message, "Game history mode is not supported")
	})

	it("rejects pages above the maximum limit", () => {
		const { error } = gameHistoryQuerySchema.validate({
			limit: 101,
		})

		assert.equal(error?.details[0].message, "Limit must be at most 100")
	})
})
