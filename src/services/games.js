import { HttpError } from "../errors.js"
import { GAME_MODES } from "../gameModes.js"
import {
	checkJapaneseGameAnswer,
	generateEnglishSentence,
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
		promptInstructions: [
			"Generate exactly one Japanese conjugation practice prompt.",
			"Include a dictionary-form verb or adjective, the requested form, and a short English context.",
			"Do not include the answer.",
			"Return only the prompt text.",
		],
		input: (difficulty) => `Write one ${difficulty} conjugation practice prompt.`,
		checkInstructions: [
			"The prompt asks for a Japanese conjugated form or a sentence using that form.",
			"The answer may be only the conjugated word or a full Japanese sentence.",
			"Mark correct when the requested conjugation is correct for the prompt.",
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
