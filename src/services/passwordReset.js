import { randomInt } from "node:crypto"
import { db } from "../db.js"
import { HttpError } from "../errors.js"
import { sendPasswordResetCode } from "./email.js"
import { hashPassword, verifyPassword } from "./password.js"

export const PASSWORD_RESET_REQUEST_MESSAGE =
	"If an account exists for that email, a reset code has been sent."
export const PASSWORD_RESET_SUCCESS_MESSAGE = "Password reset successful."

const RESET_CODE_TTL_MINUTES = 10
const MAX_RESET_CODE_ATTEMPTS = 5

export function generateResetCode() {
	return String(randomInt(0, 1_000_000)).padStart(6, "0")
}

function createInvalidResetCodeError() {
	return new HttpError(400, "Invalid or expired reset code.", {
		code: "INVALID_PASSWORD_RESET_CODE",
	})
}

function isExpired(expiresAt, now) {
	return new Date(expiresAt).getTime() <= now().getTime()
}

export function createPasswordResetService({
	query = (sql, params) => db.query(sql, params),
	sendCode = sendPasswordResetCode,
	createCode = generateResetCode,
	hashValue = hashPassword,
	verifyValue = verifyPassword,
	now = () => new Date(),
} = {}) {
	async function findUserByEmail(email) {
		const result = await query(
			`
			SELECT id, email
			FROM users
			WHERE email = $1
		`,
			[email],
		)

		return result.rows[0] || null
	}

	async function requestPasswordReset({ email }) {
		const user = await findUserByEmail(email)

		if (!user) {
			return { message: PASSWORD_RESET_REQUEST_MESSAGE }
		}

		const code = createCode()
		const codeHash = await hashValue(code)

		await query(
			`
			UPDATE password_reset_codes
			SET used_at = NOW()
			WHERE user_id = $1
				AND used_at IS NULL
		`,
			[user.id],
		)
		await query(
			`
			INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
			VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 minute'))
		`,
			[user.id, codeHash, RESET_CODE_TTL_MINUTES],
		)

		await sendCode({ email: user.email, code })

		return { message: PASSWORD_RESET_REQUEST_MESSAGE }
	}

	async function getLatestResetCode(userId) {
		const result = await query(
			`
			SELECT id,
				code_hash AS "codeHash",
				expires_at AS "expiresAt",
				attempt_count AS "attemptCount"
			FROM password_reset_codes
			WHERE user_id = $1
				AND used_at IS NULL
			ORDER BY created_at DESC
			LIMIT 1
		`,
			[userId],
		)

		return result.rows[0] || null
	}

	async function confirmPasswordReset({ email, code, password }) {
		const user = await findUserByEmail(email)
		if (!user) throw createInvalidResetCodeError()

		const resetCode = await getLatestResetCode(user.id)
		if (
			!resetCode ||
			isExpired(resetCode.expiresAt, now) ||
			resetCode.attemptCount >= MAX_RESET_CODE_ATTEMPTS
		) {
			throw createInvalidResetCodeError()
		}

		const codeMatches = await verifyValue(code, resetCode.codeHash)

		if (!codeMatches) {
			await query(
				`
				UPDATE password_reset_codes
				SET attempt_count = attempt_count + 1
				WHERE id = $1
			`,
				[resetCode.id],
			)
			throw createInvalidResetCodeError()
		}

		const passwordHash = await hashValue(password)

		await query(
			`
			UPDATE users
			SET password_hash = $1
			WHERE id = $2
		`,
			[passwordHash, user.id],
		)
		await query(
			`
			UPDATE password_reset_codes
			SET used_at = NOW()
			WHERE user_id = $1
				AND used_at IS NULL
		`,
			[user.id],
		)

		return { message: PASSWORD_RESET_SUCCESS_MESSAGE }
	}

	return {
		confirmPasswordReset,
		requestPasswordReset,
	}
}

const passwordResetService = createPasswordResetService()

export function requestPasswordReset(data) {
	return passwordResetService.requestPasswordReset(data)
}

export function confirmPasswordReset(data) {
	return passwordResetService.confirmPasswordReset(data)
}
