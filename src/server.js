import http from "node:http"
import { createApp } from "./app.js"
import { config } from "./config.js"

const server = http.createServer(createApp(config))

server.listen(config.port, () => {
	console.log(`JSB backend listening on http://localhost:${config.port}`)
})
