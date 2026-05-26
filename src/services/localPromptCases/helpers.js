const WORDS = {
	i: { kanji: "私", kana: "わたし" },
	he: { kanji: "彼", kana: "かれ" },
	she: { kanji: "彼女", kana: "かのじょ" },
	teacher: { kanji: "先生", kana: "せんせい" },
	school: { kanji: "学校", kana: "がっこう" },
	station: { kanji: "駅", kana: "えき" },
	library: { kanji: "図書館", kana: "としょかん" },
	home: { kanji: "家", kana: "いえ" },
	rain: { kanji: "雨", kana: "あめ" },
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
	fall: { kanji: "降る", kana: "ふる" },
}

export function word(key, particle, data = {}) {
	const baseWord = WORDS[key]
	if (!baseWord) throw new Error(`Unknown local prompt word: ${key}`)

	return {
		...baseWord,
		...data,
		...(particle ? { particle } : {}),
	}
}

export function conjugatedWord(key, particle, form) {
	return word(key, particle, { conjugation: form })
}

export const verbForms = {
	past: ["past"],
	passivePast: ["passive", "past"],
	causativePassivePast: ["causative", "passive", "past"],
}

export function promptCase(id, purpose, prompt, data = {}) {
	return { id, purpose, prompt, ...data }
}

export function conjugationCase(targetConjugation, prompt, japaneseTranslation) {
	return {
		prompt,
		englishSentence: prompt,
		targetConjugation,
		japaneseTranslation,
	}
}
