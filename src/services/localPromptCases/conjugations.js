import { conjugationCase, word } from "./helpers.js"

export const CONJUGATION_TARGETS_BY_DIFFICULTY = {
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

export const conjugationPromptCases = {
	negative: [
		conjugationCase("negative", "She does not eat sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
		conjugationCase("negative", "He does not drink water.", [
			word("he", "は"),
			word("water", "を"),
			word("drink"),
		]),
	],
	past: [
		conjugationCase("past", "She ate sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
		conjugationCase("past", "He drank water.", [
			word("he", "は"),
			word("water", "を"),
			word("drink"),
		]),
	],
	volitional: [
		conjugationCase("volitional", "Let's study Japanese.", [word("japanese", "を"), word("study")]),
		conjugationCase("volitional", "Let's eat sushi.", [word("sushi", "を"), word("eat")]),
	],
	conditional: [
		conjugationCase("conditional", "If she goes to school, she will study Japanese.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
			word("japanese", "を"),
			word("study"),
		]),
	],
	potential: [
		conjugationCase("potential", "She can read the book.", [
			word("she", "は"),
			word("book", "を"),
			word("read"),
		]),
		conjugationCase("potential", "He can buy a book.", [
			word("he", "は"),
			word("book", "を"),
			word("buy"),
		]),
	],
	passive: [
		conjugationCase("passive", "He is praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	causative: [
		conjugationCase("causative", "She makes him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	desire: [
		conjugationCase("desire", "She wants to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	obligation: [
		conjugationCase("obligation", "I must read the book.", [
			word("i", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	prohibition: [
		conjugationCase("prohibition", "Do not drink water.", [word("water", "を"), word("drink")]),
	],
	"negative past": [
		conjugationCase("negative past", "She did not eat sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
	],
	"potential negative": [
		conjugationCase("potential negative", "He cannot read the book.", [
			word("he", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"potential past": [
		conjugationCase("potential past", "She was able to buy a book.", [
			word("she", "は"),
			word("book", "を"),
			word("buy"),
		]),
	],
	"passive negative": [
		conjugationCase("passive negative", "He is not praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"passive past": [
		conjugationCase("passive past", "He was praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"causative negative": [
		conjugationCase("causative negative", "She does not make him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"causative past": [
		conjugationCase("causative past", "She made him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"desire negative": [
		conjugationCase("desire negative", "She does not want to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	"desire past": [
		conjugationCase("desire past", "She wanted to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	"obligation negative": [
		conjugationCase("obligation negative", "I do not have to read the book.", [
			word("i", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"potential negative past": [
		conjugationCase("potential negative past", "She was not able to read the book.", [
			word("she", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"passive negative past": [
		conjugationCase("passive negative past", "He was not praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"causative negative past": [
		conjugationCase("causative negative past", "She did not make him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"causative passive": [
		causativePassiveCase("causative passive", "She is made to go to school by the teacher."),
	],
	"causative passive negative": [
		causativePassiveCase(
			"causative passive negative",
			"She is not made to go to school by the teacher.",
		),
	],
	"causative passive past": [
		causativePassiveCase("causative passive past", "She was made to go to school by the teacher."),
	],
	"causative passive negative past": [
		causativePassiveCase(
			"causative passive negative past",
			"She was not made to go to school by the teacher.",
		),
	],
	"causative passive desire": [
		causativePassiveCase(
			"causative passive desire",
			"She wants to be made to go to school by the teacher.",
		),
	],
	"causative passive desire negative": [
		causativePassiveCase(
			"causative passive desire negative",
			"She does not want to be made to go to school by the teacher.",
		),
	],
	"causative passive desire past": [
		causativePassiveCase(
			"causative passive desire past",
			"She wanted to be made to go to school by the teacher.",
		),
	],
	"causative passive desire negative past": [
		causativePassiveCase(
			"causative passive desire negative past",
			"She did not want to be made to go to school by the teacher.",
		),
	],
}

function causativePassiveCase(targetConjugation, prompt) {
	return conjugationCase(targetConjugation, prompt, [
		word("she", "は"),
		word("teacher", "に"),
		word("school", "に"),
		word("go"),
	])
}
