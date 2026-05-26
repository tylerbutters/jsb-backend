import { Router } from "express"
import { HttpError, asyncHandler } from "../errors.js"
import { validateBody } from "../middleware/validate.js"
import {
	loginSchema,
	passwordResetConfirmSchema,
	passwordResetRequestSchema,
} from "../schemas/auth.js"
import { verifyPassword } from "../services/password.js"
import { confirmPasswordReset, requestPasswordReset } from "../services/passwordReset.js"
import { getUserByEmailWithPassword } from "../services/users.js"

const router = Router()

function createInvalidCredentialsError() {
	return new HttpError(401, "Invalid email or password.", {
		code: "INVALID_CREDENTIALS",
	})
}

router.post(
	"/password-reset/request",
	validateBody(passwordResetRequestSchema),
	asyncHandler(async (req, res) => {
		const result = await requestPasswordReset(req.validated.body)

		res.status(200).send(result)
	}),
)

router.post(
	"/password-reset/confirm",
	validateBody(passwordResetConfirmSchema),
	asyncHandler(async (req, res) => {
		const result = await confirmPasswordReset(req.validated.body)

		res.status(200).send(result)
	}),
)

router.post(
	"/",
	validateBody(loginSchema),
	asyncHandler(async (req, res) => {
		const { email, password } = req.validated.body
		const userWithPassword = await getUserByEmailWithPassword(email)

		if (!userWithPassword) {
			throw createInvalidCredentialsError()
		}

		const { passwordHash, ...user } = userWithPassword
		const passwordMatches = await verifyPassword(password, passwordHash)

		if (!passwordMatches) {
			throw createInvalidCredentialsError()
		}

		res.status(200).send({
			message: "Login successful.",
			user,
		})
	}),
)

export default router
