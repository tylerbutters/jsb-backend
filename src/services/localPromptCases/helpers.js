import { getLocalVocabularyWord } from "./vocabulary.js"

export function word(key, particle, data = {}) {
	const baseWord = getLocalVocabularyWord(key)

	return {
		kanji: baseWord.kanji,
		kana: baseWord.kana,
		...data,
		...(particle ? { particle } : {}),
	}
}

export function conjugatedWord(key, particle, form) {
	return word(key, particle, { conjugation: form })
}

export function conjugationCase(targetConjugation, prompt, japaneseTranslation) {
	return {
		prompt,
		englishSentence: prompt,
		targetConjugation,
		japaneseTranslation,
	}
}
