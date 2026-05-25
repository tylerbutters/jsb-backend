import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { validateConjugationPrompt } from "./games.js"
import {
	CONJUGATION_TARGETS_BY_DIFFICULTY,
	generateLocalGamePrompt,
} from "./localPromptGenerator.js"

const FIRST_RANDOM_VALUE = 0
const LAST_RANDOM_VALUE = 0.999999

describe("generateLocalGamePrompt", () => {
	it("generates translate prompts from local templates", () => {
		const prompt = generateLocalGamePrompt({
			mode: "translate",
			difficulty: "easy",
			random: () => FIRST_RANDOM_VALUE,
		})

		assert.equal(prompt.prompt, "I eat rice.")
		assert.equal(prompt.source, "local")
		assert.equal(prompt.templateId, "simple_present_action")
		assert.equal(prompt.profile.purpose, "translation_basic_meaning")
	})

	it("generates local prompts for each structured game mode", () => {
		for (const mode of ["fix sentence", "particles", "reorder"]) {
			const prompt = generateLocalGamePrompt({
				mode,
				difficulty: "medium",
				random: () => FIRST_RANDOM_VALUE,
			})

			assert.equal(prompt.source, "local")
			assert.equal(typeof prompt.prompt, "string")
			assert.notEqual(prompt.prompt.length, 0)
			assert.equal(prompt.profile.vocabLevel, "easy")
		}
	})

	it("generates particle prompts with sentence elements and missing particles", () => {
		for (const difficulty of ["easy", "medium", "hard"]) {
			for (const randomValue of [FIRST_RANDOM_VALUE, LAST_RANDOM_VALUE]) {
				const prompt = generateLocalGamePrompt({
					mode: "particles",
					difficulty,
					random: () => randomValue,
				})

				assert.equal(Array.isArray(prompt.japaneseTranslation), true)
				assert.notEqual(prompt.japaneseTranslation.length, 0)
				assert.equal(
					prompt.japaneseTranslation.some((wordData) => Object.hasOwn(wordData, "particle")),
					false,
				)
			}
		}

		assert.deepEqual(
			generateLocalGamePrompt({
				mode: "particles",
				difficulty: "easy",
				random: () => FIRST_RANDOM_VALUE,
			}),
			{
				prompt: "I eat sushi.",
				source: "local",
				templateId: "particle_object",
				purpose: "core_case_particle",
				profile: {
					vocabLevel: "easy",
					sentenceComplexity: "simple",
					particleLevel: "easy",
					purpose: "choose_core_case_particle",
				},
				japaneseTranslation: [
					{ kanji: "私", kana: "わたし" },
					{ kanji: "寿司", kana: "すし" },
					{ kanji: "食べる", kana: "たべる" },
				],
			},
		)
	})

	it("generates reorder prompts with English text and scrambled sentence elements", () => {
		const prompt = generateLocalGamePrompt({
			mode: "reorder",
			difficulty: "easy",
			random: () => FIRST_RANDOM_VALUE,
		})

		assert.equal(prompt.prompt, "She reads a book.")
		assert.equal(prompt.prompt.includes("English:"), false)
		assert.equal(prompt.prompt.includes("Chunks:"), false)
		assert.deepEqual(prompt.japaneseTranslation, [
			{ kanji: "本", kana: "ほん", particle: "を" },
			{ kanji: "読む", kana: "よむ" },
			{ kanji: "彼女", kana: "かのじょ", particle: "は" },
		])

		for (const difficulty of ["easy", "medium", "hard"]) {
			for (const randomValue of [FIRST_RANDOM_VALUE, LAST_RANDOM_VALUE]) {
				const nextPrompt = generateLocalGamePrompt({
					mode: "reorder",
					difficulty,
					random: () => randomValue,
				})

				assert.equal(Array.isArray(nextPrompt.japaneseTranslation), true)
				assert.notEqual(nextPrompt.japaneseTranslation.length, 0)
				assert.equal(nextPrompt.prompt.includes("English:"), false)
				assert.equal(nextPrompt.prompt.includes("Chunks:"), false)
			}
		}
	})

	it("keeps conjugation hard prompts focused on hard conjugation with easy vocab", () => {
		const prompt = generateLocalGamePrompt({
			mode: "conjugations",
			difficulty: "hard",
			random: () => FIRST_RANDOM_VALUE,
		})

		assert.equal(prompt.prompt, "She was not able to read the book.")
		assert.equal(prompt.targetConjugation, "potential negative past")
		assert.equal(prompt.profile.vocabLevel, "easy")
		assert.equal(prompt.profile.conjugationLevel, "hard")
		assert.deepEqual(validateConjugationPrompt(prompt, { difficulty: "hard" }), {
			prompt: "She was not able to read the book.",
			englishSentence: "She was not able to read the book.",
			targetConjugation: "potential negative past",
			japaneseTranslation: [
				{ kanji: "彼女", kana: "かのじょ", particle: "は" },
				{ kanji: "本", kana: "ほん", particle: "を" },
				{ kanji: "読む", kana: "よむ" },
			],
		})
	})

	it("can generate the most complex hard conjugation target without helper words", () => {
		const prompt = generateLocalGamePrompt({
			mode: "conjugations",
			difficulty: "hard",
			random: () => LAST_RANDOM_VALUE,
		})

		assert.equal(prompt.targetConjugation, "causative passive desire negative past")
		assert.deepEqual(validateConjugationPrompt(prompt, { difficulty: "hard" }), {
			prompt: "She did not want to be made to go to school by the teacher.",
			englishSentence: "She did not want to be made to go to school by the teacher.",
			targetConjugation: "causative passive desire negative past",
			japaneseTranslation: [
				{ kanji: "彼女", kana: "かのじょ", particle: "は" },
				{ kanji: "先生", kana: "せんせい", particle: "に" },
				{ kanji: "学校", kana: "がっこう", particle: "に" },
				{ kanji: "行く", kana: "いく" },
			],
		})
	})

	it("keeps every local conjugation target valid for its difficulty", () => {
		for (const [difficulty, targets] of Object.entries(CONJUGATION_TARGETS_BY_DIFFICULTY)) {
			targets.forEach((target, index) => {
				const prompt = generateLocalGamePrompt({
					mode: "conjugations",
					difficulty,
					random: () => (index + 0.1) / targets.length,
				})

				assert.equal(prompt.targetConjugation, target)
				assert.doesNotThrow(() => validateConjugationPrompt(prompt, { difficulty }))
			})
		}
	})

	it("returns null for modes without a local generator", () => {
		assert.equal(generateLocalGamePrompt({ mode: "sandbox" }), null)
		assert.equal(generateLocalGamePrompt({ mode: "shuffle" }), null)
	})
})
