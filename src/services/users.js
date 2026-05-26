import { db } from "../db.js"
import { HttpError } from "../errors.js"
import { hashPassword, verifyPassword } from "./password.js"

const publicUserFields = `
	id, email, display_name AS "displayName", created_at AS "createdAt", updated_at AS "updatedAt"
`

function createUserNotFoundError() {
	return new HttpError(404, "User not found.", {
		code: "USER_NOT_FOUND",
	})
}

export async function createUser({ email, displayName, password }) {
	const passwordHash = await hashPassword(password)
	const result = await db.query(
		`
		INSERT INTO users (email, display_name, password_hash)
		VALUES ($1, $2, $3)
		RETURNING ${publicUserFields}
	`,
		[email, displayName, passwordHash],
	)

	return result.rows[0]
}

export async function getUserById(userId) {
	const result = await db.query(
		`
		SELECT ${publicUserFields}
		FROM users
		WHERE id = $1
	`,
		[userId],
	)

	if (result.rowCount === 0) {
		throw createUserNotFoundError()
	}

	return result.rows[0]
}

function createInvalidCurrentPasswordError() {
	return new HttpError(401, "Current password is incorrect.", {
		code: "INVALID_CURRENT_PASSWORD",
	})
}

export async function updateUser(
	userId,
	{ email, displayName, currentPassword, password },
	{ query = db.query.bind(db), hashValue = hashPassword, verifyValue = verifyPassword } = {},
) {
	let passwordHash = null

	if (password) {
		const currentUserResult = await query(
			`
			SELECT password_hash AS "passwordHash"
			FROM users
			WHERE id = $1
		`,
			[userId],
		)

		if (currentUserResult.rowCount === 0) {
			throw createUserNotFoundError()
		}

		const passwordMatches = currentPassword
			? await verifyValue(currentPassword, currentUserResult.rows[0].passwordHash)
			: false

		if (!passwordMatches) {
			throw createInvalidCurrentPasswordError()
		}

		passwordHash = await hashValue(password)
	}

	const result = await query(
		`
		UPDATE users
		SET email = COALESCE($1, email),
			display_name = COALESCE($2, display_name),
			password_hash = COALESCE($3, password_hash)
		WHERE id = $4
		RETURNING ${publicUserFields}
	`,
		[email ?? null, displayName ?? null, passwordHash, userId],
	)

	if (result.rowCount === 0) {
		throw createUserNotFoundError()
	}

	return result.rows[0]
}

export async function deleteUser(userId) {
	const result = await db.query(
		`
		DELETE FROM users
		WHERE id = $1
		RETURNING id
	`,
		[userId],
	)

	if (result.rowCount === 0) {
		throw createUserNotFoundError()
	}
}

export async function getUserByEmailWithPassword(email) {
	const result = await db.query(
		`
		SELECT ${publicUserFields}, password_hash AS "passwordHash"
		FROM users
		WHERE email = $1
	`,
		[email],
	)

	return result.rows[0] || null
}
