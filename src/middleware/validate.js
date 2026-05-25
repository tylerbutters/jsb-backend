import { createErrorResponse } from "../errors.js"

const validationOptions = {
	abortEarly: true,
	stripUnknown: false,
}

function validate(source, schema) {
	return (req, res, next) => {
		const { error, value } = schema.validate(req[source], validationOptions)

		if (error) {
			res.status(400).send(createErrorResponse(error.details[0].message))
			return
		}

		req.validated = {
			...(req.validated || {}),
			[source]: value,
		}
		next()
	}
}

export const validateBody = (schema) => validate("body", schema)
export const validateParams = (schema) => validate("params", schema)
export const validateQuery = (schema) => validate("query", schema)
