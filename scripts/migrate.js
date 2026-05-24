import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { db } from "../src/db.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, "..", "migrations")

async function migrate() {
	await db.query(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			filename TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`)

	const files = (await readdir(migrationsDir))
		.filter((file) => file.endsWith(".sql"))
		.sort()

	for (const file of files) {
		const existing = await db.query(
			"SELECT 1 FROM schema_migrations WHERE filename = $1",
			[file],
		)

		if (existing.rowCount > 0) {
			console.log(`Skipping ${file}`)
			continue
		}

		const sql = await readFile(path.join(migrationsDir, file), "utf8")

		await db.query("BEGIN")
		try {
			await db.query(sql)
			await db.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file])
			await db.query("COMMIT")
			console.log(`Applied ${file}`)
		} catch (error) {
			await db.query("ROLLBACK")
			throw error
		}
	}
}

migrate()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(() => db.end())
