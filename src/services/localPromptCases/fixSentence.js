import { promptCase } from "./helpers.js"

export const fixSentencePromptCases = {
	easy: [
		promptCase(
			"fix_basic_object_particle",
			"fix_object_particle",
			"Japanese: 私は寿司に食べる。 English: I eat sushi. Fix one mistake.",
		),
		promptCase(
			"fix_basic_destination_particle",
			"fix_destination_particle",
			"Japanese: 彼女は学校を行く。 English: She goes to school. Fix one mistake.",
		),
	],
	medium: [
		promptCase(
			"fix_past_tense",
			"fix_tense",
			"Japanese: 彼女は昨日学校に行く。 English: She went to school yesterday. Fix one mistake.",
		),
		promptCase(
			"fix_location_particle",
			"fix_location_particle",
			"Japanese: 彼は図書館に日本語を勉強した。 English: He studied Japanese at the library. Fix one mistake.",
		),
	],
	hard: [
		promptCase(
			"fix_causative_passive",
			"fix_advanced_conjugation",
			"Japanese: 彼女は先生に学校に行かせた。 English: She was made to go to school by the teacher. Fix one mistake.",
		),
		promptCase(
			"fix_potential_negative_past",
			"fix_advanced_conjugation",
			"Japanese: 彼女は本を読めるなかった。 English: She was not able to read the book. Fix one mistake.",
		),
	],
}
