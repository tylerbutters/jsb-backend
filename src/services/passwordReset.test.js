import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { HttpError } from "../errors.js"
import {
	PASSWORD_RESET_REQUEST_MESSAGE,
	PASSWORD_RESET_SUCCESS_MESSAGE,
	createPasswordResetService,
} from "./passwordReset.js"

function createQueryStub({ user, resetCode } = {}) {
	const calls = []
	const query = async (sql, params = []) => {
		calls.push({ sql, params })

		if (sql.includes("FROM users") && sql.includes("WHERE email = $1")) {
			return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
		}

		if (sql.includes("FROM password_reset_codes")) {
			return { rows: resetCode ? [resetCode] : [], rowCount: resetCode ? 1 : 0 }
		}

		return { rows: [], rowCount: 1 }
	}

	return { calls, query }
}

describe("password reset service", () => {
	it("stores a hashed reset code and sends the plain code only by email", async () => {
		const sentCodes = []
		const { calls, query } = createQueryStub({
			user: { id: 12, email: "user@example.com" },
		})
		const service = createPasswordResetService({
			query,
			createCode: () => "123456",
			hashValue: async (value) => `hash:${value}`,
			sendCode: async (message) => sentCodes.push(message),
		})

		assert.deepEqual(await service.requestPasswordReset({ email: "user@example.com" }), {
			message: PASSWORD_RESET_REQUEST_MESSAGE,
		})
		assert.deepEqual(sentCodes, [{ email: "user@example.com", code: "123456" }])
		assert.equal(
			calls.some(
				(call) =>
					call.sql.includes("INSERT INTO password_reset_codes") &&
					call.params.includes("hash:123456"),
			),
			true,
		)
		assert.equal(calls.some((call) => call.params.includes("123456")), false)
	})

	it("does not reveal whether an email exists", async () => {
		const sentCodes = []
		const { calls, query } = createQueryStub()
		const service = createPasswordResetService({
			query,
			sendCode: async (message) => sentCodes.push(message),
		})

		assert.deepEqual(await service.requestPasswordReset({ email: "missing@example.com" }), {
			message: PASSWORD_RESET_REQUEST_MESSAGE,
		})
		assert.deepEqual(sentCodes, [])
		assert.equal(calls.length, 1)
	})

	it("resets the password and marks active codes used when the code matches", async () => {
		const { calls, query } = createQueryStub({
			user: { id: 12, email: "user@example.com" },
			resetCode: {
				id: 4,
				codeHash: "hash:123456",
				expiresAt: "2030-01-01T00:00:00.000Z",
				attemptCount: 0,
			},
		})
		const service = createPasswordResetService({
			query,
			hashValue: async (value) => `hash:${value}`,
			verifyValue: async (value, hash) => value === "123456" && hash === "hash:123456",
			now: () => new Date("2029-01-01T00:00:00.000Z"),
		})

		assert.deepEqual(
			await service.confirmPasswordReset({
				email: "user@example.com",
				code: "123456",
				password: "new-password",
			}),
			{ message: PASSWORD_RESET_SUCCESS_MESSAGE },
		)
		assert.equal(
			calls.some(
				(call) =>
					call.sql.includes("UPDATE users") &&
					call.params[0] === "hash:new-password" &&
					call.params[1] === 12,
			),
			true,
		)
		assert.equal(
			calls.some(
				(call) =>
					call.sql.includes("UPDATE password_reset_codes") &&
					call.sql.includes("SET used_at = NOW()"),
			),
			true,
		)
	})

	it("increments attempts and rejects a wrong code", async () => {
		const { calls, query } = createQueryStub({
			user: { id: 12, email: "user@example.com" },
			resetCode: {
				id: 4,
				codeHash: "hash:123456",
				expiresAt: "2030-01-01T00:00:00.000Z",
				attemptCount: 0,
			},
		})
		const service = createPasswordResetService({
			query,
			verifyValue: async () => false,
			now: () => new Date("2029-01-01T00:00:00.000Z"),
		})

		await assert.rejects(
			() =>
				service.confirmPasswordReset({
					email: "user@example.com",
					code: "000000",
					password: "new-password",
				}),
			(error) => {
				assert.equal(error instanceof HttpError, true)
				assert.equal(error.status, 400)
				assert.equal(error.code, "INVALID_PASSWORD_RESET_CODE")
				return true
			},
		)
		assert.equal(
			calls.some(
				(call) =>
					call.sql.includes("SET attempt_count = attempt_count + 1") && call.params[0] === 4,
			),
			true,
		)
	})
})
