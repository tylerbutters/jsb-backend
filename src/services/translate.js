const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"

export async function translateJapanese(text, fetchImpl = fetch) {
	const normalizedText = String(text || "").trim()
	if (!normalizedText) return ""

	const url = new URL(GOOGLE_TRANSLATE_URL)
	url.searchParams.set("client", "gtx")
	url.searchParams.set("sl", "ja")
	url.searchParams.set("tl", "en")
	url.searchParams.set("dt", "t")
	url.searchParams.set("q", normalizedText)

	const response = await fetchImpl(url)

	if (!response.ok) {
		throw new Error(`Translation provider returned ${response.status}.`)
	}

	const data = await response.json()
	return parseGoogleTranslation(data)
}

export function parseGoogleTranslation(data) {
	if (!Array.isArray(data?.[0])) return ""

	return data[0]
		.map((item) => (Array.isArray(item) ? item[0] : ""))
		.filter(Boolean)
		.join("")
}
