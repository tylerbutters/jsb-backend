import Joi from "joi"

export const loginSchema = Joi.object({
	email: Joi.string()
		.trim()
		.lowercase()
		.email()
		.max(254)
		.messages({
			"string.email": "Must be a valid email",
			"string.max": "Email must be at most 254 characters",
			"string.empty": "Email is required",
			"any.required": "Email is required",
		})
		.required(),
	password: Joi.string()
		.min(1)
		.max(128)
		.messages({
			"string.min": "Password is required",
			"string.max": "Password must be at most 128 characters",
			"string.empty": "Password is required",
			"any.required": "Password is required",
		})
		.required(),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})
