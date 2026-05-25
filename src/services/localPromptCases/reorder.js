import { promptCase } from "./helpers.js"

export const reorderPromptCases = {
	easy: [
		promptCase(
			"reorder_basic_action",
			"basic_word_order",
			"English: She reads a book. Chunks: 本を / 読む / 彼女は",
		),
		promptCase(
			"reorder_basic_drink",
			"basic_word_order",
			"English: He drinks water. Chunks: 飲む / 水を / 彼は",
		),
	],
	medium: [
		promptCase(
			"reorder_time_place_action",
			"time_place_word_order",
			"English: Yesterday, I studied Japanese at school. Chunks: 学校で / 昨日 / 勉強した / 私は / 日本語を",
		),
		promptCase(
			"reorder_destination_object",
			"time_place_word_order",
			"English: She bought a book at the station. Chunks: 買った / 駅で / 本を / 彼女は",
		),
	],
	hard: [
		promptCase(
			"reorder_reason_clause",
			"multi_clause_word_order",
			"English: Because he was busy, he studied at home. Chunks: 家で / 彼は / 忙しかったから / 勉強した",
		),
		promptCase(
			"reorder_condition_clause",
			"multi_clause_word_order",
			"English: If she goes to school, she will study Japanese. Chunks: 日本語を / 学校に行けば / 彼女は / 勉強する",
		),
	],
}
