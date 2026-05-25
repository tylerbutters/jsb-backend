import Joi from "joi"

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

export const translatePromptQuerySchema = Joi.object({
	difficulty: Joi.string().valid("easy", "medium", "hard").default("easy").messages({
		"any.only": "Difficulty must be easy, medium, or hard",
	}),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const checkTranslateGameSchema = Joi.object({
	englishSentence: Joi.string().trim().min(1).max(300).required().messages({
		"string.min": "English sentence is required",
		"string.max": "English sentence must be at most 300 characters",
		"string.empty": "English sentence is required",
		"any.required": "English sentence is required",
	}),
	japaneseSentence: Joi.string().trim().min(1).max(300).required().messages({
		"string.min": "Japanese sentence is required",
		"string.max": "Japanese sentence must be at most 300 characters",
		"string.empty": "Japanese sentence is required",
		"any.required": "Japanese sentence is required",
	}),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})
