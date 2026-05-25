import { promptCase } from "./helpers.js"

export const particlePromptCases = {
	easy: [
		promptCase(
			"particle_object",
			"core_case_particle",
			"Japanese: 私は寿司[blank]食べる。 Hint: I eat sushi.",
		),
		promptCase(
			"particle_destination",
			"core_case_particle",
			"Japanese: 彼女は学校[blank]行く。 Hint: She goes to school.",
		),
	],
	medium: [
		promptCase(
			"particle_location",
			"context_particle",
			"Japanese: 彼は図書館[blank]日本語を勉強した。 Hint: He studied Japanese at the library.",
		),
		promptCase(
			"particle_agent",
			"context_particle",
			"Japanese: 彼は先生[blank]褒められた。 Hint: He was praised by the teacher.",
		),
	],
	hard: [
		promptCase(
			"particle_reason_subject",
			"clause_particle",
			"Japanese: 雨[blank]降っていたから、私は家で勉強した。 Hint: Because it was raining, I studied at home.",
		),
		promptCase(
			"particle_causative_passive_agent",
			"clause_particle",
			"Japanese: 彼女は先生[blank]学校に行かされた。 Hint: She was made to go to school by the teacher.",
		),
	],
}
