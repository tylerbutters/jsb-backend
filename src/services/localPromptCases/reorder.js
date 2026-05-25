import { promptCase, word } from "./helpers.js"

export const reorderPromptCases = {
	easy: [
		promptCase(
			"reorder_basic_action",
			"basic_word_order",
			"She reads a book.",
			{
				japaneseTranslation: [word("book", "を"), word("read"), word("she", "は")],
			},
		),
		promptCase(
			"reorder_basic_drink",
			"basic_word_order",
			"He drinks water.",
			{
				japaneseTranslation: [word("drink"), word("water", "を"), word("he", "は")],
			},
		),
	],
	medium: [
		promptCase(
			"reorder_time_place_action",
			"time_place_word_order",
			"I study Japanese at school.",
			{
				japaneseTranslation: [
					word("school", "で"),
					word("study"),
					word("i", "は"),
					word("japanese", "を"),
				],
			},
		),
		promptCase(
			"reorder_destination_object",
			"time_place_word_order",
			"She buys a book at the station.",
			{
				japaneseTranslation: [
					word("buy"),
					word("station", "で"),
					word("book", "を"),
					word("she", "は"),
				],
			},
		),
	],
	hard: [
		promptCase(
			"reorder_reason_clause",
			"multi_clause_word_order",
			"She studies Japanese at school with the teacher.",
			{
				japaneseTranslation: [
					word("japanese", "を"),
					word("school", "で"),
					word("study"),
					word("she", "は"),
					word("teacher", "と"),
				],
			},
		),
		promptCase(
			"reorder_condition_clause",
			"multi_clause_word_order",
			"He reads a book at home with the teacher.",
			{
				japaneseTranslation: [
					word("teacher", "と"),
					word("book", "を"),
					word("home", "で"),
					word("read"),
					word("he", "は"),
				],
			},
		),
	],
}
