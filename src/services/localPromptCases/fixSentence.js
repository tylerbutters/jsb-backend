import { promptCase, word } from "./helpers.js"

export const fixSentencePromptCases = {
	easy: [
		promptCase(
			"fix_basic_object_particle",
			"fix_object_particle",
			"I eat sushi.",
			{
				japaneseTranslation: [word("i", "は"), word("sushi", "に"), word("eat")],
			},
		),
		promptCase(
			"fix_basic_destination_particle",
			"fix_destination_particle",
			"She goes to school.",
			{
				japaneseTranslation: [word("she", "は"), word("school", "を"), word("go")],
			},
		),
	],
	medium: [
		promptCase(
			"fix_location_particle",
			"fix_location_particle",
			"He studies Japanese at the library.",
			{
				japaneseTranslation: [
					word("he", "は"),
					word("library", "に"),
					word("japanese", "を"),
					word("study"),
				],
			},
		),
		promptCase(
			"fix_object_word",
			"fix_word_choice",
			"She reads a book.",
			{
				japaneseTranslation: [word("she", "は"), word("sushi", "を"), word("read")],
			},
		),
	],
	hard: [
		promptCase(
			"fix_companion_particle",
			"fix_context_particle",
			"She studies Japanese at school with the teacher.",
			{
				japaneseTranslation: [
					word("she", "は"),
					word("teacher", "に"),
					word("school", "で"),
					word("japanese", "を"),
					word("study"),
				],
			},
		),
		promptCase(
			"fix_verb_word",
			"fix_word_choice",
			"He reads a book at home with the teacher.",
			{
				japaneseTranslation: [
					word("he", "は"),
					word("teacher", "と"),
					word("home", "で"),
					word("book", "を"),
					word("drink"),
				],
			},
		),
	],
}
