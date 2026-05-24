import { randomBytes, scrypt as scryptCallback } from "node:crypto"
import { promisify } from "node:util"
import express from "express"
import Joi from "joi"
import { db } from "./db.js"
import {
	HttpError,
	asyncHandler,
	createErrorResponse,
	errorHandler,
} from "./errors.js"
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

function validationErrorResponse(error) {
	return createErrorResponse(error.details[0].message)
}

app.use(express.json({ limit: "16kb" }))

app.get(`${root}/health`, (req, res) => {
	res.status(200).send({
		status: "ok",
	})
})

app.post(`${root}/users/`, asyncHandler(async (req, res) => {
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
}))

app.get(`${root}/users/:user_id`, asyncHandler(async (req, res) => {
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
}))

app.post(`${root}/translate`, asyncHandler(async (req, res) => {
	const { error, value } = translateSchema.validate(req.body, validationOptions)

	if (error) {
		res.status(400).send(validationErrorResponse(error))
		return
	}

	const translation = await translateJapanese(value.text)

	res.status(200).send({
		translation,
	})
}))

app.use(errorHandler)

export default app
