import {
	CONJUGATION_TARGETS_BY_DIFFICULTY,
	LOCAL_PROMPT_CASES_BY_MODE,
	conjugationPromptCases,
	translateTemplates,
} from "./localPromptCases/index.js"

export { CONJUGATION_TARGETS_BY_DIFFICULTY }

export const GAME_PROMPT_PROFILES = {
	translate: {
		easy: {
			vocabLevel: "easy",
			grammarLevel: "easy",
			sentenceComplexity: "simple",
			purpose: "translation_basic_meaning",
		},
		medium: {
			vocabLevel: "easy",
			grammarLevel: "medium",
			sentenceComplexity: "detailed",
			purpose: "translation_with_time_place_or_object",
		},
		hard: {
			vocabLevel: "medium",
			grammarLevel: "medium",
			sentenceComplexity: "complex",
			purpose: "translation_multi_clause_meaning",
		},
	},
	conjugations: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "easy",
			purpose: "single_conjugation_target",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "medium",
			purpose: "combined_conjugation_target",
		},
		hard: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "hard",
			purpose: "advanced_conjugation_chain",
		},
	},
	"fix sentence": {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			errorLevel: "easy",
			purpose: "fix_basic_particle_or_word_error",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			errorLevel: "medium",
			purpose: "fix_particle_or_word_error",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			errorLevel: "hard",
			purpose: "fix_context_particle_or_word_error",
		},
	},
	particles: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			particleLevel: "easy",
			purpose: "choose_core_case_particle",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			particleLevel: "medium",
			purpose: "choose_context_particle",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			particleLevel: "hard",
			purpose: "choose_clause_particle",
		},
	},
	reorder: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			wordOrderLevel: "easy",
			purpose: "order_basic_sentence_chunks",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			wordOrderLevel: "medium",
			purpose: "order_time_place_sentence_chunks",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			wordOrderLevel: "hard",
			purpose: "order_multi_clause_sentence_chunks",
		},
	},
}

export function generateLocalGamePrompt({ mode, difficulty = "easy", random = Math.random }) {
	if (LOCAL_PROMPT_CASES_BY_MODE[mode]) return generatePromptCase({ mode, difficulty, random })
	if (mode === "translate") return generateTranslatePrompt({ difficulty, random })
	if (mode === "conjugations") return generateConjugationPrompt({ difficulty, random })

	return null
}

function generatePromptCase({ mode, difficulty, random }) {
	const profile = getProfile(mode, difficulty)
	const casesByDifficulty = LOCAL_PROMPT_CASES_BY_MODE[mode]
	const promptCases = casesByDifficulty[difficulty] || casesByDifficulty.easy
	const selectedPromptCase = pick(promptCases, random)
	const { id, purpose, ...promptData } = selectedPromptCase

	return {
		...promptData,
		source: "local",
		templateId: id,
		purpose: purpose || profile.purpose,
		profile,
	}
}

function generateTranslatePrompt({ difficulty, random }) {
	const profile = getProfile("translate", difficulty)
	const templates = translateTemplates.filter((template) => template.difficulty === difficulty)
	const template = pick(templates, random)
	const prompt = fillTemplate(template.template, resolveSlots(template.slots, random))

	return {
		prompt,
		source: "local",
		templateId: template.id,
		purpose: template.purpose,
		profile,
	}
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
		purpose: profile.purpose,
		profile,
	}
}

function getProfile(mode, difficulty) {
	const profiles = GAME_PROMPT_PROFILES[mode]

	return profiles[difficulty] || profiles.easy
}

function fillTemplate(template, values) {
	return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || "")
}

function resolveSlots(slots, random) {
	return Object.fromEntries(
		Object.entries(slots).map(([key, values]) => [key, pick(values, random)]),
	)
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
