import "../env.js"
import { HttpError } from "../errors.js"
import OpenAI from "openai"

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

async function createResponse(payload) {
	if (!process.env.OPENAI_API_KEY) {
		throw new HttpError(503, "AI service is not configured.", {
			code: "AI_SERVICE_NOT_CONFIGURED",
			logMessage: "OPENAI_API_KEY is not configured.",
		})
	}

	try {
		return await openai.responses.create({
			model: "gpt-4.1-nano",
			...payload,
		})
	} catch (error) {
		throw normalizeOpenAIError(error)
	}
}

function normalizeOpenAIError(error) {
	const status = error?.status
	const message =
		status === 429 ? "AI service is rate limited right now." : "AI service is unavailable right now."
	const responseStatus =
		status === 408 || status === 504 ? 504 : status === 429 || status >= 500 ? 503 : 502

	return new HttpError(responseStatus, message, {
		code: "AI_SERVICE_ERROR",
		cause: error,
		logMessage: `OpenAI request failed${status ? ` with ${status}` : ""}: ${error.message}`,
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

function difficultyInstructions(difficulty = "easy") {
	return ENGLISH_SENTENCE_DIFFICULTY_PROMPTS[difficulty] || ENGLISH_SENTENCE_DIFFICULTY_PROMPTS.easy
}

export async function generateLearningPrompt({
	difficulty = "easy",
	instructions,
	input,
	emptyResponseMessage = "AI service returned an empty prompt.",
}) {
	const resolvedInstructions =
		typeof instructions === "function" ? instructions(difficultyInstructions(difficulty)) : instructions

	try {
		const response = await createResponse({
			instructions: Array.isArray(resolvedInstructions)
				? resolvedInstructions.join(" ")
				: resolvedInstructions,
			input,
		})

		const prompt = String(response.output_text || "").trim()

		if (!prompt) {
			throw new HttpError(502, emptyResponseMessage, {
				code: "AI_EMPTY_RESPONSE",
				logMessage: `OpenAI returned an empty prompt: ${JSON.stringify(response)}`,
			})
		}

		return prompt
	} catch (error) {
		if (error instanceof HttpError) throw error

		throw new HttpError(503, "AI service is unavailable right now.", {
			code: "AI_SERVICE_ERROR",
			cause: error,
			logMessage: `generateLearningPrompt failed: ${error.message}`,
		})
	}
}

export async function generateEnglishSentence(difficulty = "easy") {
	return generateLearningPrompt({
		difficulty,
		instructions: (difficultyPrompt) => [
			"Generate exactly one English sentence for a Japanese language learner to translate.",
			difficultyPrompt,
			"Return only the sentence.",
		],
		input: `Write one ${difficulty} English sentence.`,
		emptyResponseMessage: "AI service returned an empty sentence.",
	})
}

export async function checkJapaneseGameAnswer({
	gameTitle,
	prompt,
	answer,
	checkInstructions,
}) {
	const response = await createResponse({
		instructions: [
			`You judge beginner Japanese ${gameTitle} answers.`,
			checkInstructions,
			"Return only valid JSON.",
			"The JSON must have these fields: correct boolean, feedback string.",
			"Do not wrap the JSON in markdown.",
			"If incorrect, give concise, helpful feedback without being harsh.",
			"Give feedback in English.",
		].join(" "),
		input: JSON.stringify({
			prompt,
			answer,
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
		throw new HttpError(502, "AI service returned invalid game feedback.", {
			code: "AI_INVALID_RESPONSE",
			logMessage: `Invalid JSON from OpenAI: ${rawText}`,
		})
	}
}

export async function checkJapaneseTranslation({ englishSentence, japaneseSentence }) {
	return checkJapaneseGameAnswer({
		gameTitle: "sentence translation",
		prompt: englishSentence,
		answer: japaneseSentence,
		checkInstructions: [
			"The prompt is an English sentence.",
			"The answer is the learner's Japanese sentence.",
			"Compare the English sentence with the learner's Japanese sentence.",
			"Mark correct when the Japanese naturally communicates the same meaning, even if wording differs.",
		].join(" "),
	})
}
