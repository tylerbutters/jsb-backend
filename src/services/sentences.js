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

export async function generateBasicEnglishSentence() {
	try {
		const response = await createResponse({
			instructions:
				"Generate exactly one short, basic English sentence for a beginner language learner. Return only the sentence.",
			input: "Write a basic English sentence.",
		})

		const sentence = String(response.output_text || "").trim()

		if (!sentence) {
			console.log("Full OpenAI response:", JSON.stringify(response, null, 2))
			throw new Error("OpenAI returned an empty sentence.")
		}

		return sentence
	} catch (error) {
		console.error("generateBasicEnglishSentence failed:")
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
