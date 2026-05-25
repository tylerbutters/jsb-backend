import { Router } from "express"
import { HttpError, asyncHandler } from "../errors.js"
import { validateBody } from "../middleware/validate.js"
import { loginSchema } from "../schemas/auth.js"
import { verifyPassword } from "../services/password.js"
import { getUserByEmailWithPassword } from "../services/users.js"

const router = Router()

function createInvalidCredentialsError() {
	return new HttpError(401, "Invalid email or password.", {
		code: "INVALID_CREDENTIALS",
	})
}

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
