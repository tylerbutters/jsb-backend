import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import express from "express"
import Joi from "joi"
import { db } from "./db.js"
import { HttpError, asyncHandler, createErrorResponse, errorHandler } from "./errors.js"
import { checkJapaneseTranslation, generateEnglishSentence } from "./services/sentences.js"
import { translateJapanese } from "./services/translate.js"

const scrypt = promisify(scryptCallback)
const app = express()
const root = "/api/v1"
const validationOptions = {
	abortEarly: true,
	stripUnknown: false,
}

async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex")
	const derivedKey = await scrypt(password, salt, 64)

	return `scrypt:${salt}:${derivedKey.toString("hex")}`
}

async function verifyPassword(password, passwordHash) {
	const [algorithm, salt, key] = String(passwordHash || "").split(":")

	if (algorithm !== "scrypt" || !salt || !key) return false

	const storedKey = Buffer.from(key, "hex")
	if (!storedKey.length || storedKey.length * 2 !== key.length) return false

	const derivedKey = await scrypt(password, salt, storedKey.length)

	if (storedKey.length !== derivedKey.length) return false

	return timingSafeEqual(storedKey, derivedKey)
}

const userSchema = Joi.object({
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

const userParamsSchema = Joi.object({
	user_id: Joi.number().integer().positive().max(Number.MAX_SAFE_INTEGER).required().messages({
		"number.base": "User ID must be a positive integer",
		"number.integer": "User ID must be a positive integer",
		"number.positive": "User ID must be a positive integer",
		"number.max": "User ID must be a positive integer",
		"any.required": "User ID is required",
	}),
})

const loginSchema = Joi.object({
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

const updateUserSchema = Joi.object({
	email: Joi.string().trim().lowercase().email().max(254).messages({
		"string.email": "Must be a valid email",
		"string.max": "Email must be at most 254 characters",
		"string.empty": "Email is required",
	}),
	displayName: Joi.string().trim().min(1).max(80).messages({
		"string.min": "Display name is required",
		"string.max": "Display name must be at most 80 characters",
		"string.empty": "Display name is required",
	}),
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
		}),
})
	.or("email", "displayName", "password")
	.required()
	.messages({
		"object.missing": "At least one account detail is required",
		"object.unknown": "{#label} is not allowed",
	})

const translateSchema = Joi.object({
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

const translatePromptQuerySchema = Joi.object({
	difficulty: Joi.string().valid("easy", "medium", "hard").default("easy").messages({
		"any.only": "Difficulty must be easy, medium, or hard",
	}),
})
	.required()
	.messages({
		"object.unknown": "{#label} is not allowed",
	})

const checkTranslateGameSchema = Joi.object({
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

function validationErrorResponse(error) {
	return createErrorResponse(error.details[0].message)
}

app.use(express.json({ limit: "16kb" }))

app.get(`${root}/health`, (req, res) => {
	res.status(200).send({
		status: "ok",
	})
})

app.post(
	`${root}/users/`,
	asyncHandler(async (req, res) => {
		const { error, value } = userSchema.validate(req.body, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const { email, displayName, password } = value
		const passwordHash = await hashPassword(password)
		const result = await db.query(
			`
			INSERT INTO users (email, display_name, password_hash)
			VALUES ($1, $2, $3)
			RETURNING id, email, display_name AS "displayName", created_at AS "createdAt", updated_at AS "updatedAt"
		`,
			[email, displayName, passwordHash],
		)

		res.status(201).send({
			message: "User successfully created!",
			user: result.rows[0],
		})
	}),
)

app.get(
	`${root}/users/:user_id`,
	asyncHandler(async (req, res) => {
		const { error, value } = userParamsSchema.validate(req.params, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const result = await db.query(
			`
			SELECT id, email, display_name AS "displayName", created_at AS "createdAt", updated_at AS "updatedAt"
			FROM users
			WHERE id = $1
		`,
			[value.user_id],
		)

		if (result.rowCount === 0) {
			throw new HttpError(404, "User not found.")
		}

		res.status(200).send({
			user: result.rows[0],
		})
	}),
)

app.patch(
	`${root}/users/:user_id`,
	asyncHandler(async (req, res) => {
		const { error: paramsError, value: params } = userParamsSchema.validate(
			req.params,
			validationOptions,
		)

		if (paramsError) {
			res.status(400).send(validationErrorResponse(paramsError))
			return
		}

		const { error, value } = updateUserSchema.validate(req.body, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const passwordHash = value.password ? await hashPassword(value.password) : null
		const result = await db.query(
			`
			UPDATE users
			SET email = COALESCE($1, email),
				display_name = COALESCE($2, display_name),
				password_hash = COALESCE($3, password_hash)
			WHERE id = $4
			RETURNING id, email, display_name AS "displayName", created_at AS "createdAt", updated_at AS "updatedAt"
		`,
			[value.email ?? null, value.displayName ?? null, passwordHash, params.user_id],
		)

		if (result.rowCount === 0) {
			throw new HttpError(404, "User not found.")
		}

		res.status(200).send({
			message: "Account updated.",
			user: result.rows[0],
		})
	}),
)

app.delete(
	`${root}/users/:user_id`,
	asyncHandler(async (req, res) => {
		const { error, value } = userParamsSchema.validate(req.params, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const result = await db.query(
			`
			DELETE FROM users
			WHERE id = $1
			RETURNING id
		`,
			[value.user_id],
		)

		if (result.rowCount === 0) {
			throw new HttpError(404, "User not found.")
		}

		res.status(200).send({
			message: "Account deleted.",
		})
	}),
)

app.post(
	`${root}/login`,
	asyncHandler(async (req, res) => {
		const { error, value } = loginSchema.validate(req.body, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const result = await db.query(
			`
			SELECT id, email, display_name AS "displayName", password_hash AS "passwordHash",
				created_at AS "createdAt", updated_at AS "updatedAt"
			FROM users
			WHERE email = $1
		`,
			[value.email],
		)

		if (result.rowCount === 0) {
			throw new HttpError(401, "Invalid email or password.")
		}

		const { passwordHash, ...user } = result.rows[0]
		const passwordMatches = await verifyPassword(value.password, passwordHash)

		if (!passwordMatches) {
			throw new HttpError(401, "Invalid email or password.")
		}

		res.status(200).send({
			message: "Login successful.",
			user,
		})
	}),
)

app.get(
	`${root}/games/translate/prompt`,
	asyncHandler(async (req, res) => {
		const { error, value } = translatePromptQuerySchema.validate(req.query, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const sentence = await generateEnglishSentence(value.difficulty)

		res.status(200).json({
			sentence,
			difficulty: value.difficulty,
		})
	}),
)

app.post(
	`${root}/games/translate/check`,
	asyncHandler(async (req, res) => {
		const { error, value } = checkTranslateGameSchema.validate(req.body, validationOptions)

		if (error) {
			res.status(400).send(validationErrorResponse(error))
			return
		}

		const result = await checkJapaneseTranslation(value)

		res.status(200).send(result)
	}),
)

function handleTranslateRequest(req, res) {
	const { error, value } = translateSchema.validate(req.body, validationOptions)

	if (error) {
		res.status(400).send(validationErrorResponse(error))
		return null
	}

	return translateJapanese(value.text)
}

app.post(
	`${root}/games/sandbox/translate-japanese`,
	asyncHandler(async (req, res) => {
		const translation = await handleTranslateRequest(req, res)
		if (translation === null) return

		res.status(200).send({
			translation,
		})
	}),
)

app.post(
	`${root}/games/translate`,
	asyncHandler(async (req, res) => {
		const translation = await handleTranslateRequest(req, res)
		if (translation === null) return

		res.status(200).send({
			translation,
		})
	}),
)

app.use(errorHandler)

export default app
