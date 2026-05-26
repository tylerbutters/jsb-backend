import { conjugatedWord, promptCase, word } from "./helpers.js"

export const particlePromptCases = {
	easy: [
		promptCase(
			"particle_object",
			"I eat sushi.",
			{
				japaneseTranslation: [word("i"), word("sushi"), word("eat")],
			},
		),
		promptCase(
			"particle_destination",
			"She goes to school.",
			{
				japaneseTranslation: [word("she"), word("school"), word("go")],
			},
		),
	],
	medium: [
		promptCase(
			"particle_location",
			"He studied Japanese at the library.",
			{
				japaneseTranslation: [
					word("he"),
					word("library"),
					word("japanese"),
					conjugatedWord("study", null, ["past"]),
				],
			},
		),
		promptCase(
			"particle_agent",
			"He was praised by the teacher.",
			{
				japaneseTranslation: [
					word("he"),
					word("teacher"),
					conjugatedWord("praise", null, ["passive", "past"]),
				],
			},
		),
	],
	hard: [
		promptCase(
			"particle_reason_subject",
			"Because it rained, I studied at home.",
			{
				japaneseTranslation: [
					word("rain"),
					conjugatedWord("fall", null, ["past"]),
					word("i"),
					word("home"),
					conjugatedWord("study", null, ["past"]),
				],
			},
		),
		promptCase(
			"particle_causative_passive_agent",
			"She was made to go to school by the teacher.",
			{
				japaneseTranslation: [
					word("she"),
					word("teacher"),
					word("school"),
					conjugatedWord("go", null, ["causative", "passive", "past"]),
				],
			},
		),
	],
}
