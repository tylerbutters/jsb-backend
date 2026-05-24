import "./env.js"
import pg from "pg"

const { Pool } = pg

const useSsl =
	process.env.DATABASE_SSL === "true" ||
	process.env.DATABASE_URL?.includes("render.com")

export const db = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: useSsl ? { rejectUnauthorized: false } : undefined,
})
