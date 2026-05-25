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

export function validateConjugationPrompt(data) {
	const prompt = String(data?.prompt || "").trim()
	const englishSentence = String(data?.englishSentence || "").trim()
	const japaneseTranslation = normalizeJapaneseTranslationWords(data?.japaneseTranslation)

	if (
		!prompt ||
		!englishSentence ||
		prompt !== englishSentence ||
		japaneseTranslation.length === 0 ||
		hasStandaloneAttachedParticle(japaneseTranslation)
	) {
		throw new HttpError(502, "AI service returned an invalid conjugation prompt.", {
			code: "AI_INVALID_RESPONSE",
			logMessage: `Invalid conjugation prompt from OpenAI: ${JSON.stringify(data)}`,
		})
	}

	return {
		prompt,
		englishSentence,
		japaneseTranslation,
	}
}

async function generateConjugationPrompt({ difficulty }) {
	const data = await generateJsonLearningPrompt({
		difficulty,
		instructions: (difficultyPrompt) => [
			"Generate exactly one Japanese conjugation practice item.",
			difficultyPrompt,
			"Return only valid JSON.",
			"Do not wrap the JSON in markdown.",
			"The JSON must have these fields: prompt string, englishSentence string, japaneseTranslation array.",
			"The prompt must be only a normal English sentence, not an instruction.",
			"The englishSentence must be exactly the same value as prompt.",
			"The English sentence must require one clear Japanese verb or adjective conjugation, such as wanted to, did not, could, must, wants to, was, or will.",
			"The Japanese translation must be split into words or grammar chunks for building the sentence.",
			"The japaneseTranslation items must be in natural Japanese sentence order.",
			"Every japaneseTranslation item must have kanji string and kana string.",
			"Japanese verbs and adjectives in japaneseTranslation must always be plain dictionary form without conjugation.",
			"For example, if the English sentence means 'wanted to go', the Japanese verb item must be 行く/いく, not 行きたい, 行きたかった, or 行った.",
			"If a particle attaches to a noun or pronoun, put it on that same item as particle string.",
			"Never create separate japaneseTranslation items for particles such as は, が, を, に, へ, で, と, の, も, or から.",
			"Bad example: [{\"kanji\":\"私\",\"kana\":\"わたし\"},{\"kanji\":\"は\",\"kana\":\"は\"},{\"kanji\":\"食べる\",\"kana\":\"たべる\"},{\"kanji\":\"を\",\"kana\":\"を\"},{\"kanji\":\"寿司\",\"kana\":\"すし\"}].",
			"Good example: [{\"kanji\":\"私\",\"kana\":\"わたし\",\"particle\":\"は\"},{\"kanji\":\"寿司\",\"kana\":\"すし\",\"particle\":\"を\"},{\"kanji\":\"食べる\",\"kana\":\"たべる\"}].",
			"For kana-only words, kanji and kana should be the same value.",
		],
		input: `Write one ${difficulty} English sentence that requires a Japanese conjugation, plus base-form Japanese word data.`,
		emptyResponseMessage: "AI service returned an empty conjugation prompt.",
		invalidResponseMessage: "AI service returned an invalid conjugation prompt.",
	})

	return validateConjugationPrompt(data)
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
	return (difficultyPrompt) => [
		...spec.promptInstructions,
		difficultyPrompt,
	]
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
