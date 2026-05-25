import { HttpError } from "../errors.js"
import { GAME_MODES } from "../gameModes.js"
import {
	checkJapaneseGameAnswer,
	generateEnglishSentence,
	generateJsonLearningPrompt,
	generateLearningPrompt,
} from "./sentences.js"

const gameSpecs = {
	shuffle: {
		title: "shuffle practice",
		promptInstructions: [
			"Generate exactly one shuffle practice prompt for a Japanese language learner.",
			"The learner will build a Japanese sentence in the sentence builder.",
			"Give an English target meaning and a small unordered word bank of Japanese chunks.",
			"Do not include the correct ordered Japanese sentence.",
			"Return only the prompt text.",
		],
		input: (difficulty) => `Write one ${difficulty} shuffle practice prompt.`,
		checkInstructions: [
			"The prompt gives an English target meaning and shuffled Japanese chunks.",
			"The answer is the learner's assembled Japanese sentence.",
			"Mark correct when the answer is natural Japanese and communicates the target meaning.",
		].join(" "),
	},
	translate: {
		title: "sentence translation",
		generatePrompt: ({ difficulty }) => generateEnglishSentence(difficulty),
		checkInstructions: [
			"The prompt is an English sentence.",
			"The answer is the learner's Japanese sentence.",
			"Compare the English sentence with the learner's Japanese sentence.",
			"Mark correct when the Japanese naturally communicates the same meaning, even if wording differs.",
		].join(" "),
	},
	conjugations: {
		title: "conjugation practice",
		generatePrompt: generateConjugationPrompt,
		checkInstructions: [
			"The prompt is an English sentence that requires a specific Japanese verb or adjective conjugation.",
			"The answer is the learner's Japanese sentence.",
			"Mark correct when the Japanese sentence naturally communicates the English sentence and uses the required conjugation.",
		].join(" "),
	},
	"fix sentence": {
		title: "fix sentence practice",
		promptInstructions: [
			"Generate exactly one fix-the-sentence prompt for a Japanese language learner.",
			"Include one Japanese sentence with exactly one beginner-level mistake and an English target meaning.",
			"Do not include the corrected Japanese sentence.",
			"Return only the prompt text.",
		],
		input: (difficulty) => `Write one ${difficulty} fix sentence practice prompt.`,
		checkInstructions: [
			"The prompt contains a Japanese sentence with one mistake and an English target meaning.",
			"The answer is the learner's corrected Japanese sentence.",
			"Mark correct when the mistake is fixed and the answer naturally matches the target meaning.",
		].join(" "),
	},
	particles: {
		title: "particle practice",
		promptInstructions: [
			"Generate exactly one Japanese particle practice prompt.",
			"Include a Japanese sentence with one particle blank and a short English hint.",
			"Use [blank] for the missing particle.",
			"Do not include the answer.",
			"Return only the prompt text.",
		],
		input: (difficulty) => `Write one ${difficulty} particle practice prompt.`,
		checkInstructions: [
			"The prompt asks for the missing Japanese particle.",
			"The answer may be only the particle or a full Japanese sentence using it.",
			"Mark correct when the selected particle fits the sentence and intended meaning.",
		].join(" "),
	},
	reorder: {
		title: "reorder practice",
		promptInstructions: [
			"Generate exactly one Japanese reorder practice prompt.",
			"Include an English target meaning and unordered Japanese sentence chunks.",
			"Do not include the correct ordered Japanese sentence.",
			"Return only the prompt text.",
		],
		input: (difficulty) => `Write one ${difficulty} reorder practice prompt.`,
		checkInstructions: [
			"The prompt gives an English target meaning and unordered Japanese chunks.",
			"The answer is the learner's reordered Japanese sentence.",
			"Mark correct when the chunks are ordered into natural Japanese that matches the target meaning.",
		].join(" "),
	},
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

const CONJUGATION_TARGETS_BY_DIFFICULTY = {
	easy: [
		"negative",
		"past",
		"volitional",
		"conditional",
		"potential",
		"passive",
		"causative",
		"desire",
		"obligation",
		"prohibition",
	],
	medium: [
		"negative past",
		"potential negative",
		"potential past",
		"passive negative",
		"passive past",
		"causative negative",
		"causative past",
		"desire negative",
		"desire past",
		"obligation negative",
	],
	hard: [
		"potential negative past",
		"passive negative past",
		"causative negative past",
		"causative passive",
		"causative passive negative",
		"causative passive past",
		"causative passive negative past",
		"causative passive desire",
		"causative passive desire negative",
		"causative passive desire past",
		"causative passive desire negative past",
	],
}

const CONJUGATION_PROMPT_ATTEMPTS = 3

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
		throw new HttpError(502, "AI service returned an invalid conjugation prompt.", {
			code: "AI_INVALID_RESPONSE",
			logMessage: `Invalid conjugation prompt from OpenAI: ${JSON.stringify(data)}`,
		})
	}

	return {
		prompt,
		englishSentence,
		targetConjugation,
		japaneseTranslation,
	}
}

async function generateConjugationPrompt({ difficulty }) {
	let lastError

	for (let attempt = 1; attempt <= CONJUGATION_PROMPT_ATTEMPTS; attempt += 1) {
		const data = await generateJsonLearningPrompt({
			difficulty,
			instructions: (difficultyPrompt) => [
				"Generate exactly one Japanese conjugation practice item.",
				difficultyPrompt,
				"Return only valid JSON.",
				"Do not wrap the JSON in markdown.",
				`The JSON must have these fields: prompt string, englishSentence string, targetConjugation string, japaneseTranslation array.`,
				"The prompt must be only a normal English sentence, not an instruction.",
				"The englishSentence must be exactly the same value as prompt.",
				`The targetConjugation must be exactly one of these ${difficulty} targets: ${getConjugationTargets(difficulty).join(", ")}.`,
				"Vary targetConjugation across requests.",
				"Easy targets are single conjugation concepts like past or passive.",
				"Medium targets may combine two concepts like negative past or causative past.",
				"Hard targets may combine several concepts like potential negative past or causative passive desire negative past.",
				"Do not overuse desire/want sentences.",
				"The English sentence must require the selected targetConjugation for one Japanese verb, adjective, or copula.",
				"The japaneseTranslation array is NOT the fully conjugated answer.",
				"The japaneseTranslation array is only the base-form Japanese words needed to build the answer.",
				"The japaneseTranslation items must be in natural Japanese sentence order before conjugation is applied.",
				"Every japaneseTranslation item must have kanji string and kana string.",
				"Japanese verbs and adjectives in japaneseTranslation must always be plain dictionary/base form without any conjugation.",
				"Do not include any separate word or helper that expresses the target conjugation.",
				"For desire/want sentences, include only the base verb, never たい, ほしい, or 欲しい.",
				"For negative sentences, include only the base verb/adjective, never ない or ません.",
				"For past sentences, include only the base verb/adjective, never た, だった, ました, or かった.",
				"For passive or causative sentences, include only the base verb, never れる, られる, せる, or させる.",
				"For example, if prompt is 'She wants to go.', japaneseTranslation should include 行く/いく only, not 行きたい, たい, ほしい, or 欲しい.",
				"If a particle attaches to a noun or pronoun, put it on that same item as particle string.",
				"Never attach a particle to a verb or adjective item.",
				"Never create separate japaneseTranslation items for particles such as は, が, を, に, へ, で, と, の, も, or から.",
				'Bad example: [{"kanji":"私","kana":"わたし"},{"kanji":"は","kana":"は"},{"kanji":"食べる","kana":"たべる"},{"kanji":"を","kana":"を"},{"kanji":"寿司","kana":"すし"}].',
				'Good example: [{"kanji":"私","kana":"わたし","particle":"は"},{"kanji":"寿司","kana":"すし","particle":"を"},{"kanji":"食べる","kana":"たべる"}].',
				'Bad example for \'She wants to go.\': [{"kanji":"彼女","kana":"かのじょ","particle":"は"},{"kanji":"行く","kana":"いく","particle":"を"},{"kanji":"欲しい","kana":"ほしい"}].',
				'Good example for \'She wants to go.\': {"targetConjugation":"desire","japaneseTranslation":[{"kanji":"彼女","kana":"かのじょ","particle":"は"},{"kanji":"行く","kana":"いく"}]}.',
				'Good hard example for \'She did not want to be made to go.\': {"targetConjugation":"causative passive desire negative past","japaneseTranslation":[{"kanji":"彼女","kana":"かのじょ","particle":"は"},{"kanji":"行く","kana":"いく"}]}.',
				"For kana-only words, kanji and kana should be the same value.",
			],
			input: `Write one ${difficulty} English sentence that requires a Japanese conjugation, plus base-form Japanese word data.`,
			emptyResponseMessage: "AI service returned an empty conjugation prompt.",
			invalidResponseMessage: "AI service returned an invalid conjugation prompt.",
		})

		try {
			return validateConjugationPrompt(data, { difficulty })
		} catch (error) {
			lastError = error
		}
	}

	throw lastError
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

export function getGameSpec(mode) {
	const spec = gameSpecs[mode]
	if (!spec) throw gameModeError(mode)

	return spec
}

function defaultPromptInstructions(spec) {
	return (difficultyPrompt) => [...spec.promptInstructions, difficultyPrompt]
}

export async function generateGamePrompt({ mode, difficulty = "easy" }) {
	const spec = getGameSpec(mode)

	if (spec.generatePrompt) {
		return spec.generatePrompt({ difficulty })
	}

	return generateLearningPrompt({
		difficulty,
		instructions: defaultPromptInstructions(spec),
		input: spec.input(difficulty),
	})
}

export async function checkGameAnswer({ mode, prompt, answer }) {
	const spec = getGameSpec(mode)

	return checkJapaneseGameAnswer({
		gameTitle: spec.title,
		prompt,
		answer,
		checkInstructions: spec.checkInstructions,
	})
}
