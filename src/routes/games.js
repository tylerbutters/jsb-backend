import { Router } from "express"
import { asyncHandler } from "../errors.js"
import { validateBody, validateQuery } from "../middleware/validate.js"
import {
	gameCheckSchema,
	gamePromptQuerySchema,
	translateSchema,
} from "../schemas/games.js"
import { checkGameAnswer, generateGamePrompt } from "../services/games.js"
import { translateJapanese } from "../services/translate.js"

const router = Router()

async function sendJapaneseTranslation(req, res) {
	const translation = await translateJapanese(req.validated.body.text)

	res.status(200).send({
		translation,
	})
}

router.get(
	"/prompt",
	validateQuery(gamePromptQuerySchema),
	asyncHandler(async (req, res) => {
		const { mode, difficulty } = req.validated.query
		const promptResult = await generateGamePrompt({ mode, difficulty })
		const promptData =
			typeof promptResult === "string"
				? {
						prompt: promptResult,
					}
				: promptResult

		res.status(200).json({
			mode,
			difficulty,
			...promptData,
		})
	}),
)

router.post(
	"/check",
	validateBody(gameCheckSchema),
	asyncHandler(async (req, res) => {
		const result = await checkGameAnswer(req.validated.body)

		res.status(200).send(result)
	}),
)

router.post(
	"/sandbox/translate-japanese",
	validateBody(translateSchema),
	asyncHandler(sendJapaneseTranslation),
)

router.post("/translate", validateBody(translateSchema), asyncHandler(sendJapaneseTranslation))

export default router
