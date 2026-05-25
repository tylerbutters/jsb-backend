import "../env.js"
import { HttpError } from "../errors.js"
import OpenAI from "openai"

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

async function createResponse(payload) {
	if (!process.env.OPENAI_API_KEY) {
		throw new HttpError(500, "OpenAI API key is not configured.")
	}

	return openai.responses.create({
		model: process.env.OPENAI_MODEL || "gpt-4.1-nano",
		...payload,
	})
}

const ENGLISH_SENTENCE_DIFFICULTY_PROMPTS = {
	easy: [
		"Use beginner vocabulary and one simple clause.",
		"Use present or simple past tense.",
		"Keep it around 3 to 6 words.",
		"Example style: I eat rice.",
	].join(" "),
	medium: [
		"Use common vocabulary with a little detail such as time, place, or an object.",
		"Use one main clause and avoid idioms.",
		"Keep it around 6 to 10 words.",
		"Example style: I watched a movie at home yesterday.",
	].join(" "),
	hard: [
		"Use a natural sentence with more detail, such as a reason, contrast, or sequence.",
		"Use vocabulary suitable for an intermediate learner, but avoid obscure idioms.",
		"Keep it around 10 to 16 words.",
		"Example style: Because it was raining, I studied Japanese at the library.",
	].join(" "),
}

export async function generateEnglishSentence(difficulty = "easy") {
	const difficultyPrompt =
		ENGLISH_SENTENCE_DIFFICULTY_PROMPTS[difficulty] || ENGLISH_SENTENCE_DIFFICULTY_PROMPTS.easy

	try {
		const response = await createResponse({
			instructions: [
				"Generate exactly one English sentence for a Japanese language learner to translate.",
				difficultyPrompt,
				"Return only the sentence.",
			].join(" "),
			input: `Write one ${difficulty} English sentence.`,
		})

		const sentence = String(response.output_text || "").trim()

		if (!sentence) {
			console.log("Full OpenAI response:", JSON.stringify(response, null, 2))
			throw new Error("OpenAI returned an empty sentence.")
		}

		return sentence
	} catch (error) {
		console.error("generateEnglishSentence failed:")
		console.error(error)
		throw error
	}
}

export async function checkJapaneseTranslation({ englishSentence, japaneseSentence }) {
	const response = await createResponse({
		instructions: [
			"You judge beginner Japanese sentence translations.",
			"Compare the English sentence with the learner's Japanese sentence.",
			"Return only valid JSON.",
			"The JSON must have these fields: correct boolean, feedback string.",
			"Do not wrap the JSON in markdown.",
			"Mark correct when the Japanese naturally communicates the same meaning, even if wording differs.",
			"If incorrect, give concise, helpful feedback without being harsh.",
			"Give feedback in english",
		].join(" "),
		input: JSON.stringify({
			englishSentence,
			japaneseSentence,
		}),
	})

	const rawText = String(response.output_text || "").trim()

	try {
		const result = JSON.parse(rawText)

		return {
			correct: Boolean(result.correct),
			feedback: String(result.feedback || "").trim(),
		}
	} catch {
		console.log("Invalid JSON from OpenAI:", rawText)
		throw new Error("OpenAI returned invalid translation feedback.")
	}
}
