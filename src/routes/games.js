import { Router } from "express"
import { asyncHandler } from "../errors.js"
import { validateBody, validateQuery } from "../middleware/validate.js"
import {
	checkTranslateGameSchema,
	translatePromptQuerySchema,
	translateSchema,
} from "../schemas/games.js"
import { checkJapaneseTranslation, generateEnglishSentence } from "../services/sentences.js"
import { translateJapanese } from "../services/translate.js"

const router = Router()

async function sendJapaneseTranslation(req, res) {
	const translation = await translateJapanese(req.validated.body.text)

	res.status(200).send({
		translation,
	})
}

router.get(
	"/translate/prompt",
	validateQuery(translatePromptQuerySchema),
	asyncHandler(async (req, res) => {
		const { difficulty } = req.validated.query
		const sentence = await generateEnglishSentence(difficulty)

		res.status(200).json({
			sentence,
			difficulty,
		})
	}),
)

router.post(
	"/translate/check",
	validateBody(checkTranslateGameSchema),
	asyncHandler(async (req, res) => {
		const result = await checkJapaneseTranslation(req.validated.body)

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
