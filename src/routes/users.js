import { Router } from "express"
import { asyncHandler } from "../errors.js"
import { validateBody, validateParams } from "../middleware/validate.js"
import { createUserSchema, updateUserSchema, userParamsSchema } from "../schemas/users.js"
import {
	createUser,
	deleteUser,
	getUserById,
	updateUser,
} from "../services/users.js"

const router = Router()

router.post(
	"/",
	validateBody(createUserSchema),
	asyncHandler(async (req, res) => {
		const user = await createUser(req.validated.body)

		res.status(201).send({
			message: "User successfully created!",
			user,
		})
	}),
)

router.get(
	"/:user_id",
	validateParams(userParamsSchema),
	asyncHandler(async (req, res) => {
		const user = await getUserById(req.validated.params.user_id)

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
