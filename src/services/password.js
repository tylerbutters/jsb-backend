import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCallback)

export async function hashPassword(password) {
	const salt = randomBytes(16).toString("hex")
	const derivedKey = await scrypt(password, salt, 64)

	return `scrypt:${salt}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(password, passwordHash) {
	const [algorithm, salt, key] = String(passwordHash || "").split(":")

	if (algorithm !== "scrypt" || !salt || !key) return false

	const storedKey = Buffer.from(key, "hex")
	if (!storedKey.length || storedKey.length * 2 !== key.length) return false

	const derivedKey = await scrypt(password, salt, storedKey.length)

	if (storedKey.length !== derivedKey.length) return false

	return timingSafeEqual(storedKey, derivedKey)
}
