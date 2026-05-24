export class HttpError extends Error {
	constructor(status, message) {
		super(message)
		this.status = status
	}
}

export function asyncHandler(handler) {
	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next)
	}
}

export function createErrorResponse(message) {
	return {
		error: {
			message,
		},
	}
}

export function errorHandler(error, req, res, next) {
	if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
		res.status(400).send(createErrorResponse("Request body must be valid JSON."))
		return
	}

	if (error.type === "entity.too.large") {
		res.status(413).send(createErrorResponse("Request body is too large."))
		return
	}

	if (error.code === "23505") {
		res.status(409).send(createErrorResponse("A user with that email already exists."))
		return
	}

	if (error instanceof HttpError) {
		res.status(error.status).send(createErrorResponse(error.message))
		return
	}

	console.error("Unhandled request error", error)

	res.status(500).send(createErrorResponse("Internal server error."))
}
