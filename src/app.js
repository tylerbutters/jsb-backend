import { config as defaultConfig } from "./config.js"
import { readJsonBody, sendError, sendJson } from "./http.js"
import { translateJapanese } from "./services/translate.js"

export function createApp(config = defaultConfig) {
	return async function handleRequest(req, res) {
		const headers = corsHeaders(config)

		if (req.method === "OPTIONS") {
			res.writeHead(204, headers)
			res.end()
			return
		}

		Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))

		try {
			const url = new URL(req.url, `https://jsm-3s98.onrender.com || "localhost"}`)

			if (req.method === "GET" && url.pathname === "/health") {
				sendJson(res, 200, { status: "ok" })
				return
			}

			if (req.method === "POST" && url.pathname === "/api/translate") {
				const body = await readJsonBody(req)
				const translation = await translateJapanese(body.text)
				sendJson(res, 200, { translation })
				return
			}

			sendError(res, 404, "Route not found.")
		} catch (error) {
			const statusCode = error.statusCode || 500
			const message = statusCode === 500 ? "Internal server error." : error.message
			sendError(res, statusCode, message)
		}
	}
}

function corsHeaders(config) {
	return {
		"Access-Control-Allow-Origin": config.frontendOrigin,
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		Vary: "Origin",
	}
}
