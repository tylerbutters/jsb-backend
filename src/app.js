import express from "express"
import cors from "cors"
import { HttpError, errorHandler } from "./errors.js"
import authRouter from "./routes/auth.js"
import gamesRouter from "./routes/games.js"
import healthRouter from "./routes/health.js"
import usersRouter from "./routes/users.js"

const app = express()
const apiRoot = "/api/v1"

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(Boolean)
const localDevelopmentHosts = new Set(["localhost", "127.0.0.1", "[::1]"])

function isLocalDevelopmentOrigin(origin) {
	if (process.env.NODE_ENV === "production") return false

	try {
		const { hostname, protocol } = new URL(origin)
		return localDevelopmentHosts.has(hostname) && ["http:", "https:"].includes(protocol)
	} catch {
		return false
	}
}

function isAllowedOrigin(origin) {
	return !origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)
}

app.use(
	cors({
		origin(origin, callback) {
			if (isAllowedOrigin(origin)) {
				callback(null, true)
				return
			}

			callback(
				new HttpError(403, "Origin is not allowed by CORS.", {
					code: "CORS_ORIGIN_NOT_ALLOWED",
				}),
			)
		},
	}),
)

app.use(express.json({ limit: "16kb" }))

app.use(`${apiRoot}/health`, healthRouter)
app.use(`${apiRoot}/users`, usersRouter)
app.use(`${apiRoot}/login`, authRouter)
app.use(`${apiRoot}/games`, gamesRouter)

app.use(errorHandler)

export default app
