import { conjugatedWord, promptCase, verbForms, word } from "./helpers.js"

export const particlePromptCases = {
	easy: [
		promptCase(
			"particle_object",
			"core_case_particle",
			"I eat sushi.",
			{
				japaneseTranslation: [word("i"), word("sushi"), word("eat")],
			},
		),
		promptCase(
			"particle_destination",
			"core_case_particle",
			"She goes to school.",
			{
				japaneseTranslation: [word("she"), word("school"), word("go")],
			},
		),
	],
	medium: [
		promptCase(
			"particle_location",
			"context_particle",
			"He studied Japanese at the library.",
			{
				japaneseTranslation: [
					word("he"),
					word("library"),
					word("japanese"),
					conjugatedWord("study", null, verbForms.past),
				],
			},
		),
		promptCase(
			"particle_agent",
			"context_particle",
			"He was praised by the teacher.",
			{
				japaneseTranslation: [
					word("he"),
					word("teacher"),
					conjugatedWord("praise", null, verbForms.passivePast),
				],
			},
		),
	],
	hard: [
		promptCase(
			"particle_reason_subject",
			"clause_particle",
			"Because it rained, I studied at home.",
			{
				japaneseTranslation: [
					word("rain"),
					conjugatedWord("fall", null, verbForms.past),
					word("i"),
					word("home"),
					conjugatedWord("study", null, verbForms.past),
				],
			},
		),
		promptCase(
			"particle_causative_passive_agent",
			"clause_particle",
			"She was made to go to school by the teacher.",
			{
				japaneseTranslation: [
					word("she"),
					word("teacher"),
					word("school"),
					conjugatedWord("go", null, verbForms.causativePassivePast),
				],
			},
		),
	],
}
