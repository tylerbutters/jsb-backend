import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { HttpError } from "../errors.js"
import { parseGoogleTranslation, translateJapanese } from "./translate.js"

describe("parseGoogleTranslation", () => {
	it("joins translated text segments", () => {
		assert.equal(
			parseGoogleTranslation([
				[
					["I ", "私"],
					["eat.", "食べる。"],
				],
			]),
			"I eat.",
		)
	})

	it("returns an empty string for unexpected provider data", () => {
		assert.equal(parseGoogleTranslation({}), "")
	})
})

describe("translateJapanese", () => {
	it("returns an empty string without calling the provider for blank text", async () => {
		let didCallProvider = false
		const translation = await translateJapanese("   ", () => {
			didCallProvider = true
		})

		assert.equal(translation, "")
		assert.equal(didCallProvider, false)
	})

	it("maps provider network failures to an HttpError", async () => {
		await assert.rejects(
			translateJapanese("食べる", async () => {
				throw new Error("network down")
			}),
			(error) => {
				assert.equal(error instanceof HttpError, true)
				assert.equal(error.status, 503)
				assert.equal(error.code, "TRANSLATION_PROVIDER_ERROR")
				assert.equal(error.message, "Translation service is unavailable right now.")
				return true
			},
		)
	})

	it("maps provider bad statuses to an HttpError", async () => {
		await assert.rejects(
			translateJapanese("食べる", async () => ({
				ok: false,
				status: 429,
			})),
			(error) => {
				assert.equal(error instanceof HttpError, true)
				assert.equal(error.status, 503)
				assert.equal(error.code, "TRANSLATION_PROVIDER_ERROR")
				return true
			},
		)
	})

	it("maps invalid provider JSON to an HttpError", async () => {
		await assert.rejects(
			translateJapanese("食べる", async () => ({
				ok: true,
				json: async () => {
					throw new Error("bad json")
				},
			})),
			(error) => {
				assert.equal(error instanceof HttpError, true)
				assert.equal(error.status, 502)
				assert.equal(error.message, "Translation service returned an unreadable response.")
				return true
			},
		)
	})
})
