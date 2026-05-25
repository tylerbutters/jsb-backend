import express from "express"
import cors from "cors"
import { errorHandler } from "./errors.js"
import authRouter from "./routes/auth.js"
import gamesRouter from "./routes/games.js"
import healthRouter from "./routes/health.js"
import usersRouter from "./routes/users.js"

const app = express()
const apiRoot = "/api/v1"

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(Boolean)

app.use(
	cors({
		origin(origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
				return
			}

			callback(new Error("Not allowed by CORS"))
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
