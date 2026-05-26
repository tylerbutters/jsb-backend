import assert from "node:assert/strict"
import fs from "node:fs"
import { describe, it } from "node:test"
import { validateConjugationPrompt } from "./games.js"
import { LOCAL_VOCABULARY } from "./localPromptCases/vocabulary.js"
import {
	CONJUGATION_TARGETS_BY_DIFFICULTY,
	generateLocalGamePrompt,
} from "./localPromptGenerator.js"
import { generateLocalSentence } from "./localSentenceGenerator.js"

const FIRST_RANDOM_VALUE = 0
const LAST_RANDOM_VALUE = 0.999999

describe("generateLocalGamePrompt", () => {
	it("generates translate prompts from local sentence rules", () => {
		const prompt = generateLocalGamePrompt({
			mode: "translate",
			difficulty: "easy",
			random: () => FIRST_RANDOM_VALUE,
		})

		assert.equal(prompt.prompt, "I eat sushi.")
		assert.equal(prompt.source, "local")
		assert.equal(prompt.templateId, "subject_object_verb")
		assert.equal(Object.hasOwn(prompt, "japaneseTranslation"), false)
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
				templateId: "subject_object_verb",
				profile: {
					vocabLevel: "easy",
					sentenceComplexity: "simple",
					particleLevel: "easy",
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

		assert.equal(prompt.prompt, "I eat sushi.")
		assert.equal(prompt.prompt.includes("English:"), false)
		assert.equal(prompt.prompt.includes("Chunks:"), false)
		assert.deepEqual(prompt.japaneseTranslation, [
			{ kanji: "寿司", kana: "すし", particle: "を" },
			{ kanji: "食べる", kana: "たべる" },
			{ kanji: "私", kana: "わたし", particle: "は" },
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

	it("allows non-conjugation modes to generate conjugated verb elements", () => {
		assert.deepEqual(
			generateLocalGamePrompt({
				mode: "reorder",
				difficulty: "medium",
				random: () => FIRST_RANDOM_VALUE,
			}).japaneseTranslation,
			[
				{ kanji: "学校", kana: "がっこう", particle: "で" },
				{
					kanji: "勉強する",
					kana: "べんきょうする",
					conjugation: ["past"],
				},
				{ kanji: "私", kana: "わたし", particle: "は" },
				{ kanji: "日本語", kana: "にほんご", particle: "を" },
			],
		)

		assert.deepEqual(
			generateLocalGamePrompt({
				mode: "particles",
				difficulty: "medium",
				random: () => LAST_RANDOM_VALUE,
			}).japaneseTranslation[2].conjugation,
			["passive", "past"],
		)

		assert.deepEqual(
			generateLocalGamePrompt({
				mode: "particles",
				difficulty: "hard",
				random: () => LAST_RANDOM_VALUE,
			}).japaneseTranslation[3].conjugation,
			["causative", "passive", "past"],
		)
	})

	it("samples rule generation across modes and difficulties", () => {
		for (const mode of ["translate", "particles", "reorder", "fix sentence"]) {
			for (const difficulty of ["easy", "medium", "hard"]) {
				for (const randomValue of [0, 0.2, 0.4, 0.6, 0.8, LAST_RANDOM_VALUE]) {
					const prompt = generateLocalGamePrompt({
						mode,
						difficulty,
						random: () => randomValue,
					})

					assert.equal(prompt.source, "local")
					assert.equal(typeof prompt.prompt, "string")
					assert.notEqual(prompt.prompt.length, 0)
					assert.equal(typeof prompt.templateId, "string")
					assert.notEqual(prompt.templateId.length, 0)

					if (mode === "translate") {
						assert.equal(Object.hasOwn(prompt, "japaneseTranslation"), false)
					} else {
						assert.equal(Array.isArray(prompt.japaneseTranslation), true)
						assert.notEqual(prompt.japaneseTranslation.length, 0)
						assert.equal(
							prompt.japaneseTranslation.some(
								(wordData) =>
									Object.hasOwn(wordData, "key") || Object.hasOwn(wordData, "role"),
							),
							false,
						)
					}
				}
			}
		}
	})

	it("scrambles reorder prompts without losing generated elements", () => {
		for (const difficulty of ["easy", "medium", "hard"]) {
			const random = () => 0
			const sentence = stripPromptMetadata(
				generateLocalSentence({ difficulty, random }).japaneseTranslation,
			)
			const prompt = generateLocalGamePrompt({ mode: "reorder", difficulty, random })

			assert.notDeepEqual(prompt.japaneseTranslation, sentence)
			assert.deepEqual(sortWords(prompt.japaneseTranslation), sortWords(sentence))
		}
	})

	it("introduces exactly one fix sentence mistake", () => {
		for (const difficulty of ["easy", "medium", "hard"]) {
			for (const randomValue of [FIRST_RANDOM_VALUE, LAST_RANDOM_VALUE]) {
				const random = () => randomValue
				const sentence = stripPromptMetadata(
					generateLocalSentence({ difficulty, random }).japaneseTranslation,
				)
				const prompt = generateLocalGamePrompt({ mode: "fix sentence", difficulty, random })

				assert.equal(countChangedWords(sentence, prompt.japaneseTranslation), 1)
			}
		}
	})

	it("generates fix sentence prompts with English text and one wrong element", () => {
		const prompt = generateLocalGamePrompt({
			mode: "fix sentence",
			difficulty: "easy",
			random: () => FIRST_RANDOM_VALUE,
		})

		assert.equal(prompt.prompt, "I eat sushi.")
		assert.equal(prompt.prompt.includes("Japanese:"), false)
		assert.equal(prompt.prompt.includes("Fix one mistake"), false)
		assert.deepEqual(prompt.japaneseTranslation, [
			{ kanji: "私", kana: "わたし", particle: "は" },
			{ kanji: "寿司", kana: "すし", particle: "に" },
			{ kanji: "食べる", kana: "たべる" },
		])

		for (const difficulty of ["easy", "medium", "hard"]) {
			for (const randomValue of [FIRST_RANDOM_VALUE, LAST_RANDOM_VALUE]) {
				const nextPrompt = generateLocalGamePrompt({
					mode: "fix sentence",
					difficulty,
					random: () => randomValue,
				})

				assert.equal(Array.isArray(nextPrompt.japaneseTranslation), true)
				assert.notEqual(nextPrompt.japaneseTranslation.length, 0)
				assert.equal(nextPrompt.prompt.includes("Japanese:"), false)
				assert.equal(nextPrompt.prompt.includes("Fix one mistake"), false)
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

describe("local prompt vocabulary", () => {
	it("keeps every backend vocabulary word convertible by frontend dictionaries", () => {
		const frontendElements = loadFrontendProcessedElements()

		for (const [key, vocabularyWord] of Object.entries(LOCAL_VOCABULARY)) {
			assert.equal(
				frontendElements.some((element) =>
					matchesFrontendElement(element, vocabularyWord.kanji, vocabularyWord.kana),
				),
				true,
				`${key} (${vocabularyWord.kanji}/${vocabularyWord.kana}) is missing from frontend dictionaries`,
			)
		}
	})
})

function stripPromptMetadata(words) {
	return words.map(({ key, role, ...wordData }) => wordData)
}

function sortWords(words) {
	return words.map((wordData) => JSON.stringify(wordData)).sort()
}

function countChangedWords(leftWords, rightWords) {
	return leftWords.filter(
		(wordData, index) => JSON.stringify(wordData) !== JSON.stringify(rightWords[index]),
	).length
}

function loadFrontendProcessedElements() {
	return ["nouns", "verbs", "adjectives", "adverbs", "counters"].flatMap((groupName) =>
		JSON.parse(
			fs.readFileSync(
				new URL(
					`../../../jsb-frontend/src/pages/sentence-builder-page/jmdict/processed/${groupName}.json`,
					import.meta.url,
				),
				"utf8",
			),
		),
	)
}

function matchesFrontendElement(element, kanji, kana) {
	return (
		element.text === kanji && (element.textKana === kana || (!element.textKana && kanji === kana))
	)
}
