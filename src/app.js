import express from "express"
import { errorHandler } from "./errors.js"
import authRouter from "./routes/auth.js"
import gamesRouter from "./routes/games.js"
import healthRouter from "./routes/health.js"
import usersRouter from "./routes/users.js"

const app = express()
const apiRoot = "/api/v1"

app.use(express.json({ limit: "16kb" }))

app.use(`${apiRoot}/health`, healthRouter)
app.use(`${apiRoot}/users`, usersRouter)
app.use(`${apiRoot}/login`, authRouter)
app.use(`${apiRoot}/games`, gamesRouter)

app.use(errorHandler)

export default app
