import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { HttpError, createErrorResponse, errorHandler } from "./errors.js"

function createMockResponse() {
	return {
		headersSent: false,
		statusCode: null,
		body: null,
		status(statusCode) {
			this.statusCode = statusCode
			return this
		},
		send(body) {
			this.body = body
			return this
		},
	}
}

describe("createErrorResponse", () => {
	it("includes optional error code and details", () => {
		const details = [{ path: ["email"], message: "Email is required" }]

		assert.deepEqual(
			createErrorResponse("Invalid request.", {
				code: "VALIDATION_ERROR",
				details,
			}),
			{
				error: {
					message: "Invalid request.",
					code: "VALIDATION_ERROR",
					details,
				},
			},
		)
	})
})

describe("errorHandler", () => {
	it("sends HttpError metadata to the client", () => {
		const response = createMockResponse()
		const error = new HttpError(422, "Could not process request.", {
			code: "REQUEST_UNPROCESSABLE",
			details: [{ field: "text" }],
		})

		errorHandler(error, { method: "POST", originalUrl: "/test" }, response, () => {})

		assert.equal(response.statusCode, 422)
		assert.deepEqual(response.body, {
			error: {
				message: "Could not process request.",
				code: "REQUEST_UNPROCESSABLE",
				details: [{ field: "text" }],
			},
		})
	})

	it("handles malformed JSON errors", () => {
		const response = createMockResponse()
		const error = new SyntaxError("Unexpected token")
		error.status = 400
		error.body = "{"

		errorHandler(error, { method: "POST", originalUrl: "/test" }, response, () => {})

		assert.equal(response.statusCode, 400)
		assert.deepEqual(response.body, {
			error: {
				message: "Request body must be valid JSON.",
				code: "INVALID_JSON",
			},
		})
	})
})
