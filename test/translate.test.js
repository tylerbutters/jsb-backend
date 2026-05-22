import assert from "node:assert/strict"
import test from "node:test"
import { parseGoogleTranslation, translateJapanese } from "../src/services/translate.js"

test("parseGoogleTranslation joins translated segments", () => {
	const data = [
		[
			["I eat rice.", "ご飯を食べます。"],
			["", ""],
		],
	]

	assert.equal(parseGoogleTranslation(data), "I eat rice.")
})

test("translateJapanese returns empty string for blank input", async () => {
	const result = await translateJapanese("   ", () => {
		throw new Error("fetch should not be called")
	})

	assert.equal(result, "")
})

test("translateJapanese calls provider with Japanese to English params", async () => {
	const result = await translateJapanese("猫です", async (url) => {
		assert.equal(url.searchParams.get("sl"), "ja")
		assert.equal(url.searchParams.get("tl"), "en")
		assert.equal(url.searchParams.get("q"), "猫です")

		return {
			ok: true,
			async json() {
				return [[["It is a cat.", "猫です"]]]
			},
		}
	})

	assert.equal(result, "It is a cat.")
})
