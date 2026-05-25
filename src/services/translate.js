import { HttpError } from "../errors.js"

const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
const TRANSLATION_UNAVAILABLE_MESSAGE = "Translation service is unavailable right now."

function providerStatusToHttpStatus(status) {
	if (status === 408 || status === 504) return 504
	if (status === 429 || status >= 500) return 503
	return 502
}

function createTranslationProviderError(message, { status = 503, cause, logMessage } = {}) {
	return new HttpError(status, message, {
		code: "TRANSLATION_PROVIDER_ERROR",
		cause,
		logMessage,
	})
}

export async function translateJapanese(text, fetchImpl = fetch) {
	const normalizedText = String(text || "").trim()
	if (!normalizedText) return ""

	const url = new URL(GOOGLE_TRANSLATE_URL)
	url.searchParams.set("client", "gtx")
	url.searchParams.set("sl", "ja")
	url.searchParams.set("tl", "en")
	url.searchParams.set("dt", "t")
	url.searchParams.set("q", normalizedText)

	let response
	try {
		response = await fetchImpl(url)
	} catch (error) {
		throw createTranslationProviderError(TRANSLATION_UNAVAILABLE_MESSAGE, {
			status: 503,
			cause: error,
			logMessage: `Translation provider request failed: ${error.message}`,
		})
	}

	if (!response.ok) {
		throw createTranslationProviderError(TRANSLATION_UNAVAILABLE_MESSAGE, {
			status: providerStatusToHttpStatus(response.status),
			logMessage: `Translation provider returned ${response.status}.`,
		})
	}

	let data
	try {
		data = await response.json()
	} catch (error) {
		throw createTranslationProviderError("Translation service returned an unreadable response.", {
			status: 502,
			cause: error,
			logMessage: `Translation provider returned invalid JSON: ${error.message}`,
		})
	}

	const translation = parseGoogleTranslation(data)

	if (!translation) {
		throw createTranslationProviderError("Translation service returned an empty response.", {
			status: 502,
			logMessage: "Translation provider returned an empty or unexpected response.",
		})
	}

	return translation
}

export function parseGoogleTranslation(data) {
	if (!Array.isArray(data?.[0])) return ""

	return data[0]
		.map((item) => (Array.isArray(item) ? item[0] : ""))
		.filter(Boolean)
		.join("")
}
