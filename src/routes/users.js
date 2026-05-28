import { Router } from "express"
import { asyncHandler } from "../errors.js"
import {
	clearSessionCookie,
	requireAuth,
	requireCurrentUserParam,
	setSessionCookie,
} from "../middleware/auth.js"
import { signupRateLimiter } from "../middleware/rateLimiters.js"
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js"
import {
	confirmEmailChangeSchema,
	confirmSignupSchema,
	createUserSchema,
	gameHistoryQuerySchema,
	requestEmailChangeSchema,
	updateUserSchema,
	userParamsSchema,
} from "../schemas/users.js"
import { confirmSignup, requestSignupConfirmation } from "../services/signupConfirmation.js"
import {
	confirmEmailChange,
	deleteUser,
	requestEmailChange,
	updateUser,
} from "../services/users.js"
import { createUserSession } from "../services/sessions.js"
import {
	getUserGameHistory,
	getUserGameQuota,
	getUserGameStats,
} from "../services/gameStats.js"

const router = Router()

router.post(
	"/",
	signupRateLimiter,
	validateBody(createUserSchema),
	asyncHandler(async (req, res) => {
		const result = await requestSignupConfirmation(req.validated.body)

		res.status(202).send(result)
	}),
)

router.post(
	"/signup-confirmation/request",
	signupRateLimiter,
	validateBody(createUserSchema),
	asyncHandler(async (req, res) => {
		const result = await requestSignupConfirmation(req.validated.body)

		res.status(202).send(result)
	}),
)

router.post(
	"/signup-confirmation/confirm",
	signupRateLimiter,
	validateBody(confirmSignupSchema),
	asyncHandler(async (req, res) => {
		const result = await confirmSignup(req.validated.body)
		const session = await createUserSession(result.user.id)

		setSessionCookie(res, session.token)

		res.status(201).send(result)
	}),
)

router.post(
	"/:user_id/email-change/request",
	validateParams(userParamsSchema),
	requireAuth,
	requireCurrentUserParam,
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
	"/:user_id/stats",
	validateParams(userParamsSchema),
	requireAuth,
	requireCurrentUserParam,
	asyncHandler(async (req, res) => {
		const stats = await getUserGameStats(req.validated.params.user_id)

		res.status(200).send(stats)
	}),
)

router.get(
	"/:user_id/game-quota",
	validateParams(userParamsSchema),
	requireAuth,
	requireCurrentUserParam,
	asyncHandler(async (req, res) => {
		const quota = await getUserGameQuota(req.validated.params.user_id)

		res.status(200).send(quota)
	}),
)

router.get(
	"/:user_id/game-history",
	validateParams(userParamsSchema),
	validateQuery(gameHistoryQuerySchema),
	requireAuth,
	requireCurrentUserParam,
	asyncHandler(async (req, res) => {
		const history = await getUserGameHistory(
			req.validated.params.user_id,
			req.validated.query,
		)

		res.status(200).send(history)
	}),
)

router.patch(
	"/:user_id",
	validateParams(userParamsSchema),
	requireAuth,
	requireCurrentUserParam,
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
	requireAuth,
	requireCurrentUserParam,
	asyncHandler(async (req, res) => {
		await deleteUser(req.validated.params.user_id)
		clearSessionCookie(res)

		res.status(200).send({
			message: "Account deleted.",
		})
	}),
)

export default router
