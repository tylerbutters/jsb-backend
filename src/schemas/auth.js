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

const resetEmailSchema = Joi.string()
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
	.required()

export const passwordResetRequestSchema = Joi.object({
	email: resetEmailSchema,
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const passwordResetConfirmSchema = Joi.object({
	email: resetEmailSchema,
	code: Joi.string()
		.trim()
		.pattern(/^\d{6}$/)
		.messages({
			"string.empty": "Code is required",
			"string.pattern.base": "Code must be 6 digits",
			"any.required": "Code is required",
		})
		.required(),
	password: Joi.string()
		.min(8)
		.max(128)
		.pattern(/[A-Za-z]/, "letter")
		.pattern(/[0-9]/, "number")
		.messages({
			"string.min": "Password must be at least 8 characters",
			"string.max": "Password must be at most 128 characters",
			"string.pattern.name": "Password must include at least one {#name}",
			"string.empty": "Password is required",
			"any.required": "Password is required",
		})
		.required(),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})
