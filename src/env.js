import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

const envPath = path.join(process.cwd(), ".env")

function parseEnvValue(value) {
	const trimmed = value.trim()
	const quote = trimmed[0]

	if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote)) {
		return trimmed.slice(1, -1)
	}

	return trimmed
}

if (existsSync(envPath)) {
	const lines = readFileSync(envPath, "utf8").split(/\r?\n/)

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith("#")) continue

		const separatorIndex = trimmed.indexOf("=")
		if (separatorIndex === -1) continue

		const key = trimmed.slice(0, separatorIndex).trim()
		const value = parseEnvValue(trimmed.slice(separatorIndex + 1))

		if (key && process.env[key] === undefined) {
			process.env[key] = value
		}
	}
}
