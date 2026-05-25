const WORDS = {
	i: { kanji: "私", kana: "わたし" },
	he: { kanji: "彼", kana: "かれ" },
	she: { kanji: "彼女", kana: "かのじょ" },
	teacher: { kanji: "先生", kana: "せんせい" },
	school: { kanji: "学校", kana: "がっこう" },
	book: { kanji: "本", kana: "ほん" },
	sushi: { kanji: "寿司", kana: "すし" },
	water: { kanji: "水", kana: "みず" },
	japanese: { kanji: "日本語", kana: "にほんご" },
	go: { kanji: "行く", kana: "いく" },
	eat: { kanji: "食べる", kana: "たべる" },
	drink: { kanji: "飲む", kana: "のむ" },
	read: { kanji: "読む", kana: "よむ" },
	buy: { kanji: "買う", kana: "かう" },
	study: { kanji: "勉強する", kana: "べんきょうする" },
	praise: { kanji: "褒める", kana: "ほめる" },
}

export function word(key, particle) {
	const baseWord = WORDS[key]
	if (!baseWord) throw new Error(`Unknown local prompt word: ${key}`)

	return particle ? { ...baseWord, particle } : { ...baseWord }
}

export function promptCase(id, purpose, prompt) {
	return { id, purpose, prompt }
}

export function conjugationCase(targetConjugation, prompt, japaneseTranslation) {
	return {
		prompt,
		englishSentence: prompt,
		targetConjugation,
		japaneseTranslation,
	}
}
