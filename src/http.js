export function sendJson(res, statusCode, payload, headers = {}) {
	const body = JSON.stringify(payload)

	res.writeHead(statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Content-Length": Buffer.byteLength(body),
		...headers,
	})
	res.end(body)
}

export function sendError(res, statusCode, message, details) {
	sendJson(res, statusCode, {
		error: {
			message,
			...(details ? { details } : {}),
		},
	})
}

export async function readJsonBody(req) {
	const chunks = []

	for await (const chunk of req) {
		chunks.push(chunk)
	}

	const rawBody = Buffer.concat(chunks).toString("utf8")
	if (!rawBody) return {}

	try {
		return JSON.parse(rawBody)
	} catch {
		const error = new Error("Request body must be valid JSON.")
		error.statusCode = 400
		throw error
	}
}
