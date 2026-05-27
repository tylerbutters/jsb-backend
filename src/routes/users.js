import { Router } from "express"
import { asyncHandler } from "../errors.js"
import { validateBody, validateParams } from "../middleware/validate.js"
import {
	confirmEmailChangeSchema,
	confirmSignupSchema,
	createUserSchema,
	requestEmailChangeSchema,
	updateUserSchema,
	userParamsSchema,
} from "../schemas/users.js"
import { confirmSignup, requestSignupConfirmation } from "../services/signupConfirmation.js"
import {
	confirmEmailChange,
	deleteUser,
	getUserIdByEmail,
	requestEmailChange,
	updateUser,
} from "../services/users.js"

const router = Router()

router.post(
	"/",
	validateBody(createUserSchema),
	asyncHandler(async (req, res) => {
		const result = await requestSignupConfirmation(req.validated.body)

		res.status(202).send(result)
	}),
)

router.post(
	"/signup-confirmation/request",
	validateBody(createUserSchema),
	asyncHandler(async (req, res) => {
		const result = await requestSignupConfirmation(req.validated.body)

		res.status(202).send(result)
	}),
)

router.post(
	"/signup-confirmation/confirm",
	validateBody(confirmSignupSchema),
	asyncHandler(async (req, res) => {
		const result = await confirmSignup(req.validated.body)

		res.status(201).send(result)
	}),
)

router.post(
	"/:user_id/email-change/request",
	validateParams(userParamsSchema),
	validateBody(requestEmailChangeSchema),
	asyncHandler(async (req, res) => {
		const result = await requestEmailChange(req.validated.params.user_id, req.validated.body)

		res.status(202).send(result)
	}),
)

router.post(
	"/email-change/confirm",
	validateBody(confirmEmailChangeSchema),
	asyncHandler(async (req, res) => {
		const result = await confirmEmailChange(req.validated.body)

		res.status(200).send(result)
	}),
)

router.get(
	"/:email",
	// validateParams(userParamsSchema),
	asyncHandler(async (req, res) => {
		const user = await getUserIdByEmail(req.params.email)

		res.status(200).send({
			user,
		})
	}),
)

router.patch(
	"/:user_id",
	validateParams(userParamsSchema),
	validateBody(updateUserSchema),
	asyncHandler(async (req, res) => {
		const user = await updateUser(req.validated.params.user_id, req.validated.body)

		res.status(200).send({
			message: "Account updated.",
			user,
		})
	}),
)

router.delete(
	"/:user_id",
	validateParams(userParamsSchema),
	asyncHandler(async (req, res) => {
		await deleteUser(req.validated.params.user_id)

		res.status(200).send({
			message: "Account deleted.",
		})
	}),
)

export default router
