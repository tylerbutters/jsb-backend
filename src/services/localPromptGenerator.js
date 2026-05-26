import {
	CONJUGATION_TARGETS_BY_DIFFICULTY,
	conjugationPromptCases,
} from "./localPromptCases/conjugations.js"
import { generateRuleBasedGamePrompt } from "./localSentenceGenerator.js"

export { CONJUGATION_TARGETS_BY_DIFFICULTY }

export const GAME_PROMPT_PROFILES = {
	translate: {
		easy: {
			vocabLevel: "easy",
			grammarLevel: "easy",
			sentenceComplexity: "simple",
		},
		medium: {
			vocabLevel: "easy",
			grammarLevel: "medium",
			sentenceComplexity: "detailed",
		},
		hard: {
			vocabLevel: "medium",
			grammarLevel: "medium",
			sentenceComplexity: "complex",
		},
	},
	conjugations: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "easy",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "medium",
		},
		hard: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "hard",
		},
	},
	"fix sentence": {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			errorLevel: "easy",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			errorLevel: "medium",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			errorLevel: "hard",
		},
	},
	particles: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			particleLevel: "easy",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			particleLevel: "medium",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			particleLevel: "hard",
		},
	},
	reorder: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			wordOrderLevel: "easy",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			wordOrderLevel: "medium",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			wordOrderLevel: "hard",
		},
	},
}

export function generateLocalGamePrompt({ mode, difficulty = "easy", random = Math.random }) {
	if (["translate", "fix sentence", "particles", "reorder"].includes(mode)) {
		return generateRuleBasedGamePrompt({
			mode,
			difficulty,
			profile: getProfile(mode, difficulty),
			random,
		})
	}
	if (mode === "conjugations") return generateConjugationPrompt({ difficulty, random })

	return null
}

function generateConjugationPrompt({ difficulty, random }) {
	const profile = getProfile("conjugations", difficulty)
	const targets =
		CONJUGATION_TARGETS_BY_DIFFICULTY[difficulty] || CONJUGATION_TARGETS_BY_DIFFICULTY.easy
	const targetConjugation = pick(targets, random)
	const promptCase = pick(conjugationPromptCases[targetConjugation], random)

	return {
		...cloneConjugationCase(promptCase),
		source: "local",
		templateId: `conjugation_${targetConjugation.replaceAll(" ", "_")}`,
		profile,
	}
}

function getProfile(mode, difficulty) {
	const profiles = GAME_PROMPT_PROFILES[mode]

	return profiles[difficulty] || profiles.easy
}

function pick(items, random) {
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error("Cannot pick from an empty prompt list.")
	}

	const index = Math.min(items.length - 1, Math.floor(random() * items.length))

	return items[index]
}

function cloneConjugationCase(promptCase) {
	return {
		...promptCase,
		japaneseTranslation: promptCase.japaneseTranslation.map((wordData) => ({ ...wordData })),
	}
}
