import Joi from "joi"
import { GAME_MODES } from "../gameModes.js"

const difficultySchema = Joi.string().valid("easy", "medium", "hard").default("easy").messages({
	"any.only": "Difficulty must be easy, medium, or hard",
})

const gameModeValueSchema = Joi.string()
	.valid(...GAME_MODES)
	.messages({
		"any.only": "Game mode is not supported",
		"any.required": "Game mode is required",
		"string.empty": "Game mode is required",
	})
const gameModeSchema = gameModeValueSchema.required()

export const translateSchema = Joi.object({
	text: Joi.string().trim().min(1).max(1000).required().messages({
		"string.min": "Text is required",
		"string.max": "Text must be at most 1000 characters",
		"string.empty": "Text is required",
		"any.required": "Text is required",
	}),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const gamePromptQuerySchema = Joi.object({
	mode: gameModeSchema,
	difficulty: difficultySchema,
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const gameCheckSchema = Joi.object({
	mode: gameModeSchema,
	prompt: Joi.string().trim().min(1).max(1000).required().messages({
		"string.min": "Prompt is required",
		"string.max": "Prompt must be at most 1000 characters",
		"string.empty": "Prompt is required",
		"any.required": "Prompt is required",
	}),
	answer: Joi.string().trim().min(1).max(1000).required().messages({
		"string.min": "Answer is required",
		"string.max": "Answer must be at most 1000 characters",
		"string.empty": "Answer is required",
		"any.required": "Answer is required",
	}),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})
