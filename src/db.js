import "./env.js"
import pg from "pg"

const { Pool } = pg
const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"])

function getDatabaseUrl() {
	try {
		return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null
	} catch {
		return null
	}
}

function shouldUseSsl(databaseUrl) {
	if (process.env.DATABASE_SSL === "true") return true
	if (process.env.DATABASE_SSL === "false") return false
	if (process.env.NODE_ENV === "production") return true
	if (!databaseUrl) return false

	const sslMode = databaseUrl.searchParams.get("sslmode")
	if (sslMode && sslMode !== "disable") return true

	return Boolean(databaseUrl.hostname && !localDatabaseHosts.has(databaseUrl.hostname))
}

const databaseUrl = getDatabaseUrl()

export const db = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : false,
})
