import { HttpError } from "../errors.js"
import { GAME_MODES } from "../gameModes.js"
import {
	CONJUGATION_TARGETS_BY_DIFFICULTY,
	generateLocalGamePrompt,
} from "./localPromptGenerator.js"
import { checkJapaneseGameAnswer } from "./sentences.js"

const gameCheckInstructions = {
	translate: [
		"The prompt is an English sentence.",
		"The answer is the learner's Japanese sentence.",
		"Compare the English sentence with the learner's Japanese sentence.",
		"Mark correct when the Japanese naturally communicates the same meaning, even if wording differs.",
	].join(" "),
	conjugations: [
		"The prompt is an English sentence that requires a specific Japanese verb or adjective conjugation.",
		"The answer is the learner's Japanese sentence.",
		"Mark correct when the Japanese sentence naturally communicates the English sentence and uses the required conjugation.",
	].join(" "),
	"fix sentence": [
		"The prompt contains a Japanese sentence with one mistake and an English target meaning.",
		"The answer is the learner's corrected Japanese sentence.",
		"Mark correct when the mistake is fixed and the answer naturally matches the target meaning.",
	].join(" "),
	particles: [
		"The prompt is an English target meaning for a Japanese sentence with missing particles.",
		"The answer is the learner's completed Japanese sentence.",
		"Mark correct when the sentence naturally communicates the target meaning and uses fitting particles.",
	].join(" "),
	reorder: [
		"The prompt is an English target meaning.",
		"The learner was given the Japanese sentence elements in the wrong order.",
		"The answer is the learner's reordered Japanese sentence.",
		"Mark correct when the answer is natural Japanese and matches the target meaning.",
	].join(" "),
}

const ATTACHED_PARTICLES = new Set([
	"から",
	"は",
	"も",
	"が",
	"を",
	"に",
	"へ",
	"で",
	"と",
	"こそ",
	"さえ",
	"しか",
	"ばかり",
	"だけ",
	"のみ",
	"の",
	"な",
])

const CONJUGATION_HELPER_WORDS = new Set([
	"たい",
	"たかった",
	"ほしい",
	"欲しい",
	"ない",
	"なかった",
	"ません",
	"ました",
	"られる",
	"れる",
	"させる",
	"せる",
	"せられる",
])

function normalizeJapaneseTranslationWords(words) {
	if (!Array.isArray(words)) return []

	return words
		.map((word) => {
			const normalizedWord = {
				kanji: String(word?.kanji || "").trim(),
				kana: String(word?.kana || "").trim(),
			}
			const particle = String(word?.particle || "").trim()

			if (particle) normalizedWord.particle = particle

			return normalizedWord
		})
		.filter((word) => word.kanji && word.kana)
}

function hasStandaloneAttachedParticle(words) {
	return words.some(
		(word) => word.kanji === word.kana && ATTACHED_PARTICLES.has(word.kanji) && !word.particle,
	)
}

function hasConjugationHelperWord(words) {
	return words.some((word) => {
		const values = [word.kanji, word.kana]
		return values.some((value) => CONJUGATION_HELPER_WORDS.has(value))
	})
}

function getConjugationTargets(difficulty = "hard") {
	const difficultyOrder = ["easy", "medium", "hard"]
	const difficultyIndex = difficultyOrder.indexOf(difficulty)
	const maxIndex = difficultyIndex === -1 ? difficultyOrder.length - 1 : difficultyIndex

	return difficultyOrder
		.slice(0, maxIndex + 1)
		.flatMap((difficultyKey) => CONJUGATION_TARGETS_BY_DIFFICULTY[difficultyKey])
}

export function validateConjugationPrompt(data, { difficulty = "hard" } = {}) {
	const prompt = String(data?.prompt || "").trim()
	const englishSentence = String(data?.englishSentence || "").trim()
	const targetConjugation = String(data?.targetConjugation || "").trim()
	const japaneseTranslation = normalizeJapaneseTranslationWords(data?.japaneseTranslation)
	const allowedTargets = getConjugationTargets(difficulty)

	if (
		!prompt ||
		!englishSentence ||
		prompt !== englishSentence ||
		!allowedTargets.includes(targetConjugation) ||
		japaneseTranslation.length === 0 ||
		hasStandaloneAttachedParticle(japaneseTranslation) ||
		hasConjugationHelperWord(japaneseTranslation)
	) {
		throw new HttpError(502, "Prompt generator returned an invalid conjugation prompt.", {
			code: "AI_INVALID_RESPONSE",
			logMessage: `Invalid conjugation prompt: ${JSON.stringify(data)}`,
		})
	}

	return {
		prompt,
		englishSentence,
		targetConjugation,
		japaneseTranslation,
	}
}

function gameModeError(mode) {
	return new HttpError(400, "Game mode is not supported.", {
		code: "UNSUPPORTED_GAME_MODE",
		details: {
			mode,
			supportedModes: GAME_MODES,
		},
	})
}

export function getGameCheckInstructions(mode) {
	const checkInstructions = gameCheckInstructions[mode]
	if (!checkInstructions) throw gameModeError(mode)

	return checkInstructions
}

export async function generateGamePrompt({ mode, difficulty = "easy" }) {
	const prompt = generateLocalGamePrompt({ mode, difficulty })
	if (!prompt) throw gameModeError(mode)

	return prompt
}

export async function checkGameAnswer({ mode, prompt, answer }) {
	const checkInstructions = getGameCheckInstructions(mode)

	return checkJapaneseGameAnswer({
		gameTitle: mode,
		prompt,
		answer,
		checkInstructions,
	})
}
