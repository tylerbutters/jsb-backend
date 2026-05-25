import { conjugationPromptCases } from "./conjugations.js"
import { fixSentencePromptCases } from "./fixSentence.js"
import { particlePromptCases } from "./particles.js"
import { reorderPromptCases } from "./reorder.js"
import { translateTemplates } from "./translate.js"

export { CONJUGATION_TARGETS_BY_DIFFICULTY } from "./conjugations.js"

export const LOCAL_PROMPT_CASES_BY_MODE = {
	"fix sentence": fixSentencePromptCases,
	particles: particlePromptCases,
	reorder: reorderPromptCases,
}

export { conjugationPromptCases, translateTemplates }
