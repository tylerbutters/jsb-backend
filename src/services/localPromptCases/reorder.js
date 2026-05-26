import { conjugatedWord, promptCase, word } from "./helpers.js"

export const reorderPromptCases = {
	easy: [
		promptCase(
			"reorder_basic_action",
			"She reads a book.",
			{
				japaneseTranslation: [word("book", "を"), word("read"), word("she", "は")],
			},
		),
		promptCase(
			"reorder_basic_drink",
			"He drinks water.",
			{
				japaneseTranslation: [word("drink"), word("water", "を"), word("he", "は")],
			},
		),
	],
	medium: [
		promptCase(
			"reorder_time_place_action",
			"I studied Japanese at school.",
			{
				japaneseTranslation: [
					word("school", "で"),
					conjugatedWord("study", null, ["past"]),
					word("i", "は"),
					word("japanese", "を"),
				],
			},
		),
		promptCase(
			"reorder_destination_object",
			"She bought a book at the station.",
			{
				japaneseTranslation: [
					conjugatedWord("buy", null, ["past"]),
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
			"She studied Japanese at school with the teacher.",
			{
				japaneseTranslation: [
					word("japanese", "を"),
					word("school", "で"),
					conjugatedWord("study", null, ["past"]),
					word("she", "は"),
					word("teacher", "と"),
				],
			},
		),
		promptCase(
			"reorder_condition_clause",
			"He read a book at home with the teacher.",
			{
				japaneseTranslation: [
					word("teacher", "と"),
					word("book", "を"),
					word("home", "で"),
					conjugatedWord("read", null, ["past"]),
					word("he", "は"),
				],
			},
		),
	],
}
