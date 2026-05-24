import { randomBytes, scrypt as scryptCallback } from "node:crypto"
import { promisify } from "node:util"
import express from "express"
import Joi from "joi"
import { db } from "./db.js"
import { translateJapanese } from "./services/translate.js"

const scrypt = promisify(scryptCallback)
const app = express()
const root = "/api/v1"

async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex")
	const derivedKey = await scrypt(password, salt, 64)

	return `scrypt:${salt}:${derivedKey.toString("hex")}`
}

const userSchema = Joi.object({
	email: Joi.string()
		.email()
		.messages({
			"string.email": "Must be a valid email",
			"string.empty": "Email is required",
			"any.required": "Email is required",
		})
		.required(),
	displayName: Joi.string()
		.messages({
			"string.empty": "Display name is required",
			"any.required": "Display name is required",
		})
		.required(),
	password: Joi.string()
		.min(8)
		.max(128)
		.messages({
			"string.min": "Password must be at least 8 characters",
			"string.max": "Password must be at most 128 characters",
			"string.empty": "Password is required",
			"any.required": "Password is required",
		})
		.required(),
})

app.use(express.json())

app.get(`${root}/health`, (req, res) => {
	res.status(200).send({
		status: "ok",
	})
})

app.post(`${root}/users/`, async (req, res) => {
	const { email, displayName, password } = req.body
	const { error } = userSchema.validate(req.body)

	if (error) {
		res.status(400).send({
			error: {
				message: error.details[0].message,
			},
		})
		return
	}

	try {
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
	} catch (error) {
		console.error("Failed to create user", error)

		if (error.code === "23505") {
			res.status(409).send({
				error: {
					message: "A user with that email already exists.",
				},
			})
			return
		}

		res.status(500).send({
			error: {
				message: "Failed to create user.",
			},
		})
	}
})

app.get(`${root}/users/:user_id`, async (req, res) => {
	try {
		const result = await db.query(
			`
				SELECT id, email, display_name AS "displayName", created_at AS "createdAt", updated_at AS "updatedAt"
				FROM users
				WHERE id = $1
			`,
			[req.params.user_id],
		)

		if (result.rowCount === 0) {
			res.status(404).send({
				error: {
					message: "User not found.",
				},
			})
			return
		}

		res.status(200).send({
			user: result.rows[0],
		})
	} catch (error) {
		res.status(500).send({
			error: {
				message: "Failed to get user.",
			},
		})
	}
})

app.post(`${root}/translate`, async (req, res) => {
	try {
		const translation = await translateJapanese(req.body?.text)

		res.status(200).send({
			translation,
		})
	} catch (error) {
		res.status(500).send({
			error: {
				message: "Translation failed.",
			},
		})
	}
})

export default app
