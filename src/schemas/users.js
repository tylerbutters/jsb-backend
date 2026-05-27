import Joi from "joi"

export const emailSchema = Joi.string().trim().lowercase().email().max(254).messages({
	"string.email": "Must be a valid email",
	"string.max": "Email must be at most 254 characters",
	"string.empty": "Email is required",
	"any.required": "Email is required",
})

const passwordSchema = Joi.string()
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

const currentPasswordSchema = Joi.string()
	.messages({
		"string.empty": "Current password is required",
		"any.required": "Current password is required",
	})
	.required()

export const createUserSchema = Joi.object({
	email: emailSchema.required(),
	displayName: Joi.string()
		.trim()
		.min(1)
		.max(80)
		.messages({
			"string.min": "Display name is required",
			"string.max": "Display name must be at most 80 characters",
			"string.empty": "Display name is required",
			"any.required": "Display name is required",
		})
		.required(),
	password: passwordSchema.required(),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const confirmSignupSchema = Joi.object({
	email: emailSchema.required(),
	code: Joi.string()
		.trim()
		.pattern(/^\d{6}$/)
		.messages({
			"string.empty": "Code is required",
			"string.pattern.base": "Code must be 6 digits",
			"any.required": "Code is required",
		})
		.required(),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

export const userParamsSchema = Joi.object({
	user_id: Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER).required().messages({
		"number.base": "User ID must be a positive integer",
		"number.integer": "User ID must be a positive integer",
		"number.positive": "User ID must be a positive integer",
		"number.max": "User ID must be a positive integer",
		"any.required": "User ID is required",
	}),
})

export const updateUserSchema = Joi.object({
	email: emailSchema,
	displayName: Joi.string().trim().min(1).max(80).messages({
		"string.min": "Display name is required",
		"string.max": "Display name must be at most 80 characters",
		"string.empty": "Display name is required",
	}),
	currentPassword: Joi.when("password", {
		is: Joi.exist(),
		then: currentPasswordSchema.required(),
		otherwise: Joi.forbidden(),
	}),
	password: passwordSchema,
})
	.or("email", "displayName", "password")
	.required()
	.messages({
		"object.missing": "At least one account detail is required",
		"object.unknown": "{#label} is not allowed",
	})

export const requestEmailChangeSchema = Joi.object({
	email: emailSchema.required(),
})

export const confirmEmailChangeSchema = Joi.object({
	token: Joi.string()
		.trim()
		.min(32)
		.max(256)
		.messages({
			"string.empty": "Token is required",
			"string.min": "Invalid token",
			"string.max": "Invalid token",
			"any.required": "Token is required",
		})
		.required(),
})
