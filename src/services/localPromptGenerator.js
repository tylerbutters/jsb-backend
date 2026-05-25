export const CONJUGATION_TARGETS_BY_DIFFICULTY = {
	easy: [
		"negative",
		"past",
		"volitional",
		"conditional",
		"potential",
		"passive",
		"causative",
		"desire",
		"obligation",
		"prohibition",
	],
	medium: [
		"negative past",
		"potential negative",
		"potential past",
		"passive negative",
		"passive past",
		"causative negative",
		"causative past",
		"desire negative",
		"desire past",
		"obligation negative",
	],
	hard: [
		"potential negative past",
		"passive negative past",
		"causative negative past",
		"causative passive",
		"causative passive negative",
		"causative passive past",
		"causative passive negative past",
		"causative passive desire",
		"causative passive desire negative",
		"causative passive desire past",
		"causative passive desire negative past",
	],
}

export const GAME_PROMPT_PROFILES = {
	shuffle: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			wordOrderLevel: "easy",
			purpose: "build_from_basic_chunks",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			wordOrderLevel: "medium",
			purpose: "build_from_time_place_chunks",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			wordOrderLevel: "hard",
			purpose: "build_from_clause_chunks",
		},
	},
	translate: {
		easy: {
			vocabLevel: "easy",
			grammarLevel: "easy",
			sentenceComplexity: "simple",
			purpose: "translation_basic_meaning",
		},
		medium: {
			vocabLevel: "easy",
			grammarLevel: "medium",
			sentenceComplexity: "detailed",
			purpose: "translation_with_time_place_or_object",
		},
		hard: {
			vocabLevel: "medium",
			grammarLevel: "medium",
			sentenceComplexity: "complex",
			purpose: "translation_multi_clause_meaning",
		},
	},
	conjugations: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "easy",
			purpose: "single_conjugation_target",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "medium",
			purpose: "combined_conjugation_target",
		},
		hard: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			conjugationLevel: "hard",
			purpose: "advanced_conjugation_chain",
		},
	},
	"fix sentence": {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			errorLevel: "easy",
			purpose: "fix_basic_particle_or_word_order_error",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			errorLevel: "medium",
			purpose: "fix_tense_or_particle_error",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			errorLevel: "hard",
			purpose: "fix_advanced_conjugation_error",
		},
	},
	particles: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			particleLevel: "easy",
			purpose: "choose_core_case_particle",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			particleLevel: "medium",
			purpose: "choose_context_particle",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			particleLevel: "hard",
			purpose: "choose_clause_particle",
		},
	},
	reorder: {
		easy: {
			vocabLevel: "easy",
			sentenceComplexity: "simple",
			wordOrderLevel: "easy",
			purpose: "order_basic_sentence_chunks",
		},
		medium: {
			vocabLevel: "easy",
			sentenceComplexity: "detailed",
			wordOrderLevel: "medium",
			purpose: "order_time_place_sentence_chunks",
		},
		hard: {
			vocabLevel: "medium",
			sentenceComplexity: "complex",
			wordOrderLevel: "hard",
			purpose: "order_multi_clause_sentence_chunks",
		},
	},
}

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

const TRANSLATE_TEMPLATES = [
	{
		id: "simple_present_action",
		difficulty: "easy",
		purpose: "basic_action",
		template: "{sentence}.",
		slots: {
			sentence: ["I eat rice", "She drinks water", "He reads a book", "The teacher goes to school"],
		},
	},
	{
		id: "simple_preference_or_state",
		difficulty: "easy",
		purpose: "basic_state",
		template: "{sentence}.",
		slots: {
			sentence: ["I like sushi", "She is busy", "He is a student", "The book is new"],
		},
	},
	{
		id: "time_place_action",
		difficulty: "medium",
		purpose: "time_place_detail",
		template: "{sentence}.",
		slots: {
			sentence: [
				"Yesterday, I bought a book at the station",
				"She studied Japanese at the library",
				"He watched a movie at home",
				"I drank tea before work",
			],
		},
	},
	{
		id: "want_plan_action",
		difficulty: "medium",
		purpose: "plans_and_wants",
		template: "{sentence}.",
		slots: {
			sentence: [
				"I want to read a book tonight",
				"She wants to go to school tomorrow",
				"He plans to study Japanese after work",
				"I want to eat sushi with my friend",
			],
		},
	},
	{
		id: "reason_or_sequence",
		difficulty: "hard",
		purpose: "reason_or_sequence",
		template: "{sentence}.",
		slots: {
			sentence: [
				"Because it was raining, I studied Japanese at the library",
				"After she finished work, she bought a book at the station",
				"Although he was busy, he watched a movie with his friend",
				"When I arrived at school, the teacher was reading a book",
			],
		},
	},
	{
		id: "contrast_or_condition",
		difficulty: "hard",
		purpose: "contrast_or_condition",
		template: "{sentence}.",
		slots: {
			sentence: [
				"If I have time tomorrow, I will study Japanese at home",
				"She wanted to eat sushi, but the restaurant was closed",
				"He went to the library because his room was noisy",
				"I read the book before I watched the movie",
			],
		},
	},
]

const LOCAL_PROMPT_CASES_BY_MODE = {
	shuffle: {
		easy: [
			promptCase(
				"shuffle_basic_action",
				"basic_action_chunks",
				"English: I eat sushi. Chunks: 食べる / 私は / 寿司を",
			),
			promptCase(
				"shuffle_basic_movement",
				"basic_movement_chunks",
				"English: She goes to school. Chunks: 学校に / 行く / 彼女は",
			),
		],
		medium: [
			promptCase(
				"shuffle_time_place_action",
				"time_place_chunks",
				"English: Yesterday, she bought a book at the station. Chunks: 本を / 駅で / 買った / 昨日 / 彼女は",
			),
			promptCase(
				"shuffle_place_study",
				"place_action_chunks",
				"English: He studied Japanese at the library. Chunks: 図書館で / 日本語を / 彼は / 勉強した",
			),
		],
		hard: [
			promptCase(
				"shuffle_reason_clause",
				"reason_clause_chunks",
				"English: Because it was raining, I studied Japanese at the library. Chunks: 図書館で / 雨が降っていたから / 日本語を / 勉強した / 私は",
			),
			promptCase(
				"shuffle_sequence_clause",
				"sequence_clause_chunks",
				"English: After she finished work, she bought a book. Chunks: 仕事が終わってから / 本を / 買った / 彼女は",
			),
		],
	},
	"fix sentence": {
		easy: [
			promptCase(
				"fix_basic_object_particle",
				"fix_object_particle",
				"Japanese: 私は寿司に食べる。 English: I eat sushi. Fix one mistake.",
			),
			promptCase(
				"fix_basic_destination_particle",
				"fix_destination_particle",
				"Japanese: 彼女は学校を行く。 English: She goes to school. Fix one mistake.",
			),
		],
		medium: [
			promptCase(
				"fix_past_tense",
				"fix_tense",
				"Japanese: 彼女は昨日学校に行く。 English: She went to school yesterday. Fix one mistake.",
			),
			promptCase(
				"fix_location_particle",
				"fix_location_particle",
				"Japanese: 彼は図書館に日本語を勉強した。 English: He studied Japanese at the library. Fix one mistake.",
			),
		],
		hard: [
			promptCase(
				"fix_causative_passive",
				"fix_advanced_conjugation",
				"Japanese: 彼女は先生に学校に行かせた。 English: She was made to go to school by the teacher. Fix one mistake.",
			),
			promptCase(
				"fix_potential_negative_past",
				"fix_advanced_conjugation",
				"Japanese: 彼女は本を読めるなかった。 English: She was not able to read the book. Fix one mistake.",
			),
		],
	},
	particles: {
		easy: [
			promptCase(
				"particle_object",
				"core_case_particle",
				"Japanese: 私は寿司[blank]食べる。 Hint: I eat sushi.",
			),
			promptCase(
				"particle_destination",
				"core_case_particle",
				"Japanese: 彼女は学校[blank]行く。 Hint: She goes to school.",
			),
		],
		medium: [
			promptCase(
				"particle_location",
				"context_particle",
				"Japanese: 彼は図書館[blank]日本語を勉強した。 Hint: He studied Japanese at the library.",
			),
			promptCase(
				"particle_agent",
				"context_particle",
				"Japanese: 彼は先生[blank]褒められた。 Hint: He was praised by the teacher.",
			),
		],
		hard: [
			promptCase(
				"particle_reason_subject",
				"clause_particle",
				"Japanese: 雨[blank]降っていたから、私は家で勉強した。 Hint: Because it was raining, I studied at home.",
			),
			promptCase(
				"particle_causative_passive_agent",
				"clause_particle",
				"Japanese: 彼女は先生[blank]学校に行かされた。 Hint: She was made to go to school by the teacher.",
			),
		],
	},
	reorder: {
		easy: [
			promptCase(
				"reorder_basic_action",
				"basic_word_order",
				"English: She reads a book. Chunks: 本を / 読む / 彼女は",
			),
			promptCase(
				"reorder_basic_drink",
				"basic_word_order",
				"English: He drinks water. Chunks: 飲む / 水を / 彼は",
			),
		],
		medium: [
			promptCase(
				"reorder_time_place_action",
				"time_place_word_order",
				"English: Yesterday, I studied Japanese at school. Chunks: 学校で / 昨日 / 勉強した / 私は / 日本語を",
			),
			promptCase(
				"reorder_destination_object",
				"time_place_word_order",
				"English: She bought a book at the station. Chunks: 買った / 駅で / 本を / 彼女は",
			),
		],
		hard: [
			promptCase(
				"reorder_reason_clause",
				"multi_clause_word_order",
				"English: Because he was busy, he studied at home. Chunks: 家で / 彼は / 忙しかったから / 勉強した",
			),
			promptCase(
				"reorder_condition_clause",
				"multi_clause_word_order",
				"English: If she goes to school, she will study Japanese. Chunks: 日本語を / 学校に行けば / 彼女は / 勉強する",
			),
		],
	},
}

const CONJUGATION_PROMPT_CASES = {
	negative: [
		conjugationCase("negative", "She does not eat sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
		conjugationCase("negative", "He does not drink water.", [
			word("he", "は"),
			word("water", "を"),
			word("drink"),
		]),
	],
	past: [
		conjugationCase("past", "She ate sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
		conjugationCase("past", "He drank water.", [
			word("he", "は"),
			word("water", "を"),
			word("drink"),
		]),
	],
	volitional: [
		conjugationCase("volitional", "Let's study Japanese.", [word("japanese", "を"), word("study")]),
		conjugationCase("volitional", "Let's eat sushi.", [word("sushi", "を"), word("eat")]),
	],
	conditional: [
		conjugationCase("conditional", "If she goes to school, she will study Japanese.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
			word("japanese", "を"),
			word("study"),
		]),
	],
	potential: [
		conjugationCase("potential", "She can read the book.", [
			word("she", "は"),
			word("book", "を"),
			word("read"),
		]),
		conjugationCase("potential", "He can buy a book.", [
			word("he", "は"),
			word("book", "を"),
			word("buy"),
		]),
	],
	passive: [
		conjugationCase("passive", "He is praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	causative: [
		conjugationCase("causative", "She makes him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	desire: [
		conjugationCase("desire", "She wants to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	obligation: [
		conjugationCase("obligation", "I must read the book.", [
			word("i", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	prohibition: [
		conjugationCase("prohibition", "Do not drink water.", [word("water", "を"), word("drink")]),
	],
	"negative past": [
		conjugationCase("negative past", "She did not eat sushi.", [
			word("she", "は"),
			word("sushi", "を"),
			word("eat"),
		]),
	],
	"potential negative": [
		conjugationCase("potential negative", "He cannot read the book.", [
			word("he", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"potential past": [
		conjugationCase("potential past", "She was able to buy a book.", [
			word("she", "は"),
			word("book", "を"),
			word("buy"),
		]),
	],
	"passive negative": [
		conjugationCase("passive negative", "He is not praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"passive past": [
		conjugationCase("passive past", "He was praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"causative negative": [
		conjugationCase("causative negative", "She does not make him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"causative past": [
		conjugationCase("causative past", "She made him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"desire negative": [
		conjugationCase("desire negative", "She does not want to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	"desire past": [
		conjugationCase("desire past", "She wanted to go to school.", [
			word("she", "は"),
			word("school", "に"),
			word("go"),
		]),
	],
	"obligation negative": [
		conjugationCase("obligation negative", "I do not have to read the book.", [
			word("i", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"potential negative past": [
		conjugationCase("potential negative past", "She was not able to read the book.", [
			word("she", "は"),
			word("book", "を"),
			word("read"),
		]),
	],
	"passive negative past": [
		conjugationCase("passive negative past", "He was not praised by the teacher.", [
			word("he", "は"),
			word("teacher", "に"),
			word("praise"),
		]),
	],
	"causative negative past": [
		conjugationCase("causative negative past", "She did not make him go to school.", [
			word("she", "は"),
			word("he", "を"),
			word("school", "に"),
			word("go"),
		]),
	],
	"causative passive": [
		causativePassiveCase("causative passive", "She is made to go to school by the teacher."),
	],
	"causative passive negative": [
		causativePassiveCase(
			"causative passive negative",
			"She is not made to go to school by the teacher.",
		),
	],
	"causative passive past": [
		causativePassiveCase("causative passive past", "She was made to go to school by the teacher."),
	],
	"causative passive negative past": [
		causativePassiveCase(
			"causative passive negative past",
			"She was not made to go to school by the teacher.",
		),
	],
	"causative passive desire": [
		causativePassiveCase(
			"causative passive desire",
			"She wants to be made to go to school by the teacher.",
		),
	],
	"causative passive desire negative": [
		causativePassiveCase(
			"causative passive desire negative",
			"She does not want to be made to go to school by the teacher.",
		),
	],
	"causative passive desire past": [
		causativePassiveCase(
			"causative passive desire past",
			"She wanted to be made to go to school by the teacher.",
		),
	],
	"causative passive desire negative past": [
		causativePassiveCase(
			"causative passive desire negative past",
			"She did not want to be made to go to school by the teacher.",
		),
	],
}

export function generateLocalGamePrompt({ mode, difficulty = "easy", random = Math.random }) {
	if (LOCAL_PROMPT_CASES_BY_MODE[mode]) return generatePromptCase({ mode, difficulty, random })
	if (mode === "translate") return generateTranslatePrompt({ difficulty, random })
	if (mode === "conjugations") return generateConjugationPrompt({ difficulty, random })

	return null
}

function generatePromptCase({ mode, difficulty, random }) {
	const profile = getProfile(mode, difficulty)
	const casesByDifficulty = LOCAL_PROMPT_CASES_BY_MODE[mode]
	const promptCases = casesByDifficulty[difficulty] || casesByDifficulty.easy
	const selectedPromptCase = pick(promptCases, random)

	return {
		prompt: selectedPromptCase.prompt,
		source: "local",
		templateId: selectedPromptCase.id,
		purpose: selectedPromptCase.purpose || profile.purpose,
		profile,
	}
}

function generateTranslatePrompt({ difficulty, random }) {
	const profile = getProfile("translate", difficulty)
	const templates = TRANSLATE_TEMPLATES.filter((template) => template.difficulty === difficulty)
	const template = pick(templates, random)
	const prompt = fillTemplate(template.template, resolveSlots(template.slots, random))

	return {
		prompt,
		source: "local",
		templateId: template.id,
		purpose: template.purpose,
		profile,
	}
}

function generateConjugationPrompt({ difficulty, random }) {
	const profile = getProfile("conjugations", difficulty)
	const targets =
		CONJUGATION_TARGETS_BY_DIFFICULTY[difficulty] || CONJUGATION_TARGETS_BY_DIFFICULTY.easy
	const targetConjugation = pick(targets, random)
	const promptCase = pick(CONJUGATION_PROMPT_CASES[targetConjugation], random)

	return {
		...cloneConjugationCase(promptCase),
		source: "local",
		templateId: `conjugation_${targetConjugation.replaceAll(" ", "_")}`,
		purpose: profile.purpose,
		profile,
	}
}

function getProfile(mode, difficulty) {
	const profiles = GAME_PROMPT_PROFILES[mode]

	return profiles[difficulty] || profiles.easy
}

function fillTemplate(template, values) {
	return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || "")
}

function resolveSlots(slots, random) {
	return Object.fromEntries(
		Object.entries(slots).map(([key, values]) => [key, pick(values, random)]),
	)
}

function pick(items, random) {
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error("Cannot pick from an empty prompt list.")
	}

	const index = Math.min(items.length - 1, Math.floor(random() * items.length))

	return items[index]
}

function word(key, particle) {
	const baseWord = WORDS[key]
	if (!baseWord) throw new Error(`Unknown local prompt word: ${key}`)

	return particle ? { ...baseWord, particle } : { ...baseWord }
}

function promptCase(id, purpose, prompt) {
	return { id, purpose, prompt }
}

function conjugationCase(targetConjugation, prompt, japaneseTranslation) {
	return {
		prompt,
		englishSentence: prompt,
		targetConjugation,
		japaneseTranslation,
	}
}

function causativePassiveCase(targetConjugation, prompt) {
	return conjugationCase(targetConjugation, prompt, [
		word("she", "は"),
		word("teacher", "に"),
		word("school", "に"),
		word("go"),
	])
}

function cloneConjugationCase(promptCase) {
	return {
		...promptCase,
		japaneseTranslation: promptCase.japaneseTranslation.map((wordData) => ({ ...wordData })),
	}
}
