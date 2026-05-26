import { conjugatedWord, word } from "./localPromptCases/helpers.js"
import { getLocalVocabularyWord } from "./localPromptCases/vocabulary.js"

const DIFFICULTY_ORDER = ["easy", "medium", "hard"]
const SUBJECT_KEYS = ["i", "he", "she", "teacher", "student", "friend"]
const PATIENT_KEYS = ["he", "she", "student", "friend"]
const AGENT_KEYS = ["teacher", "student", "friend"]
const COMPANION_KEYS = ["teacher", "student", "friend"]
const DESTINATION_KEYS = [
	"school",
	"station",
	"library",
	"home",
	"room",
	"store",
	"park",
	"company",
	"hospital",
	"movieTheater",
]
const PLACE_KEYS = [
	"school",
	"station",
	"library",
	"home",
	"room",
	"store",
	"park",
	"company",
	"hospital",
	"movieTheater",
]
const DESCRIBED_NOUN_KEYS = ["book", "library", "room", "movie", "letter", "newspaper"]
const ADJECTIVE_KEYS = ["new", "old", "big", "small", "quiet", "simple"]
const ADVERB_KEYS = ["quickly", "slowly", "well", "sometimes"]
const SIMPLE_ACTIONS = [
	{ verb: "eat", objects: ["sushi", "rice"] },
	{ verb: "drink", objects: ["water", "tea"] },
	{ verb: "read", objects: ["book", "newspaper", "letter"] },
]
const PLACE_ACTIONS = [
	{ verb: "study", objects: ["japanese"] },
	{ verb: "read", objects: ["book", "newspaper", "letter"] },
	{ verb: "eat", objects: ["sushi", "rice"] },
	{ verb: "drink", objects: ["water", "tea"] },
	{ verb: "buy", objects: ["book", "newspaper", "tea", "rice"] },
	{ verb: "watch", objects: ["movie"] },
	{ verb: "write", objects: ["letter"] },
	{ verb: "speak", objects: ["japanese"] },
]
const COMPANION_ACTIONS = [
	{ verb: "study", objects: ["japanese"] },
	{ verb: "read", objects: ["book", "newspaper", "letter"] },
	{ verb: "eat", objects: ["sushi", "rice"] },
	{ verb: "drink", objects: ["water", "tea"] },
	{ verb: "watch", objects: ["movie"] },
	{ verb: "speak", objects: ["japanese"] },
]
const POTENTIAL_ACTIONS = [
	{ verb: "read", objects: ["book", "newspaper", "letter"] },
	{ verb: "buy", objects: ["book", "newspaper", "tea", "rice"] },
	{ verb: "study", objects: ["japanese"] },
	{ verb: "watch", objects: ["movie"] },
	{ verb: "write", objects: ["letter"] },
]
const COUNTED_OBJECTS = [
	{
		object: "book",
		counter: "bookCounter",
		counts: [
			{ number: "2", english: "two" },
			{ number: "3", english: "three" },
		],
	},
	{
		object: "letter",
		counter: "flatCounter",
		counts: [
			{ number: "2", english: "two" },
			{ number: "4", english: "four" },
		],
	},
	{
		object: "newspaper",
		counter: "generalCounter",
		counts: [
			{ number: "2", english: "two" },
			{ number: "5", english: "five" },
		],
	},
]

const SENTENCE_FRAMES_BY_DIFFICULTY = {
	easy: [
		{
			id: "subject_object_verb",
			generate: generateSubjectObjectVerb,
		},
		{
			id: "subject_destination_verb",
			generate: generateSubjectDestinationVerb,
		},
		{
			id: "adjective_predicate",
			generate: generateAdjectivePredicate,
		},
	],
	medium: [
		{
			id: "subject_place_object_verb",
			generate: generateSubjectPlaceObjectVerb,
		},
		{
			id: "subject_companion_object_verb",
			generate: generateSubjectCompanionObjectVerb,
		},
		{
			id: "adverb_object_verb",
			generate: generateAdverbObjectVerb,
		},
		{
			id: "passive_agent",
			generate: generatePassiveAgent,
		},
	],
	hard: [
		{
			id: "reason_clause_action",
			generate: generateReasonClauseAction,
		},
		{
			id: "potential_negative_past",
			generate: generatePotentialNegativePast,
		},
		{
			id: "counted_object_action",
			generate: generateCountedObjectAction,
		},
		{
			id: "causative_passive_destination",
			generate: generateCausativePassiveDestination,
		},
	],
}

export function generateLocalSentence({ difficulty = "easy", random = Math.random } = {}) {
	const resolvedDifficulty = resolveDifficulty(difficulty)
	const frame = pick(SENTENCE_FRAMES_BY_DIFFICULTY[resolvedDifficulty], random)
	const sentence = frame.generate({ difficulty: resolvedDifficulty, random })

	return {
		...sentence,
		templateId: frame.id,
	}
}

export function generateRuleBasedGamePrompt({
	mode,
	difficulty = "easy",
	profile,
	random = Math.random,
}) {
	const sentence = generateLocalSentence({ difficulty, random })
	const result = {
		prompt: sentence.prompt,
		source: "local",
		templateId: sentence.templateId,
		profile,
	}

	if (mode === "translate") return result
	if (mode === "particles") {
		return {
			...result,
			japaneseTranslation: stripOutputMetadata(sentence.japaneseTranslation).map(
				({ particle, ...wordData }) => wordData,
			),
		}
	}
	if (mode === "reorder") {
		return {
			...result,
			japaneseTranslation: stripOutputMetadata(scrambleWords(sentence.japaneseTranslation)),
		}
	}
	if (mode === "fix sentence") {
		return {
			...result,
			japaneseTranslation: stripOutputMetadata(
				introduceSentenceMistake(sentence.japaneseTranslation, difficulty, random),
			),
		}
	}

	return null
}

function generateSubjectObjectVerb({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const action = pick(SIMPLE_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)
	const tense = pick(["present", "past"], random)

	return {
		prompt: sentence(
			`${subjectText(subject)} ${verbText(action.verb, subject, tense)} ${objectText(object)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, tenseToConjugation(tense), "verb"),
		],
	}
}

function generateSubjectDestinationVerb({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const destination = pickWordKey(DESTINATION_KEYS, "destination", difficulty, random)
	const tense = pick(["present", "past"], random)

	return {
		prompt: sentence(
			`${subjectText(subject)} ${verbText("go", subject, tense)} ${destinationText(destination)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(destination, "に", "destination"),
			promptVerb("go", tenseToConjugation(tense), "verb"),
		],
	}
}

function generateAdjectivePredicate({ difficulty, random }) {
	const subject = pickWordKey(DESCRIBED_NOUN_KEYS, "describedSubject", difficulty, random)
	const adjective = pickWordKey(ADJECTIVE_KEYS, "adjective", difficulty, random)

	return {
		prompt: sentence(`${describedSubjectText(subject)} is ${adjectiveText(adjective)}`),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(adjective, null, "adjective"),
		],
	}
}

function generateSubjectPlaceObjectVerb({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const place = pickWordKey(PLACE_KEYS, "place", difficulty, random)
	const action = pick(PLACE_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)
	const tense = pick(["past", "present", "negative"], random)

	return {
		prompt: sentence(
			`${subjectText(subject)} ${verbText(action.verb, subject, tense)} ${objectText(
				object,
			)} ${placeText(place)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(place, "で", "place"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, tenseToConjugation(tense), "verb"),
		],
	}
}

function generateAdverbObjectVerb({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const adverb = pickWordKey(ADVERB_KEYS, "adverb", difficulty, random)
	const action = pick(COMPANION_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)
	const tense = pick(["present", "past"], random)

	return {
		prompt: sentence(
			`${subjectText(subject)} ${verbText(action.verb, subject, tense)} ${objectText(
				object,
			)} ${adverbText(adverb)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(adverb, null, "adverb"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, tenseToConjugation(tense), "verb"),
		],
	}
}

function generateSubjectCompanionObjectVerb({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const companion = pickDistinctWordKey(
		COMPANION_KEYS,
		"companion",
		difficulty,
		random,
		subject,
	)
	const action = pick(COMPANION_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)
	const tense = pick(["past", "present", "negative"], random)

	return {
		prompt: sentence(
			`${subjectText(subject)} ${verbText(action.verb, subject, tense)} ${objectText(
				object,
			)} with ${objectText(companion)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(companion, "と", "companion"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, tenseToConjugation(tense), "verb"),
		],
	}
}

function generatePassiveAgent({ difficulty, random }) {
	const patient = pickWordKey(PATIENT_KEYS, "patient", difficulty, random)
	const agent = pickDistinctWordKey(AGENT_KEYS, "agent", difficulty, random, patient)
	const tense = pick(["present", "negative", "past"], random)
	const passivePrompt = {
		present: `${subjectText(patient)} is praised by ${objectText(agent)}`,
		past: `${subjectText(patient)} was praised by ${objectText(agent)}`,
		negative: `${subjectText(patient)} is not praised by ${objectText(agent)}`,
	}[tense]
	const conjugation = tense === "negative" ? ["passive", "negative"] : ["passive"]

	return {
		prompt: sentence(passivePrompt),
		japaneseTranslation: [
			promptWord(patient, "は", "subject"),
			promptWord(agent, "に", "agent"),
			promptVerb("praise", tense === "past" ? ["passive", "past"] : conjugation, "verb"),
		],
	}
}

function generateReasonClauseAction({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const place = pickWordKey(PLACE_KEYS, "place", difficulty, random)
	const action = pick(PLACE_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)

	return {
		prompt: sentence(
			`because it rained, ${subjectText(subject)} ${verbText(
				action.verb,
				subject,
				"past",
			)} ${objectText(object)} ${placeText(place)}`,
		),
		japaneseTranslation: [
			promptWord("rain", "が", "weather"),
			promptVerb("fall", ["te"], "weatherVerb"),
			promptWord(subject, "は", "subject"),
			promptWord(place, "で", "place"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, ["past"], "verb"),
		],
	}
}

function generatePotentialNegativePast({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const place = pickWordKey(PLACE_KEYS, "place", difficulty, random)
	const action = pick(POTENTIAL_ACTIONS, random)
	const object = pickWordKey(action.objects, "object", difficulty, random)

	return {
		prompt: sentence(
			`${subjectText(subject)} was not able to ${verbBase(action.verb)} ${objectText(
				object,
			)} ${placeText(place)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(place, "で", "place"),
			promptWord(object, "を", "object"),
			promptVerb(action.verb, ["potential", "negative", "past"], "verb"),
		],
	}
}

function generateCountedObjectAction({ difficulty, random }) {
	const subject = pickWordKey(SUBJECT_KEYS, "subject", difficulty, random)
	const place = pickWordKey(PLACE_KEYS, "place", difficulty, random)
	const countedObject = pick(COUNTED_OBJECTS, random)
	const count = pick(countedObject.counts, random)

	return {
		prompt: sentence(
			`${subjectText(subject)} bought ${count.english} ${pluralObjectText(
				countedObject.object,
			)} ${placeText(place)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(place, "で", "place"),
			promptWord(countedObject.object, "を", "object"),
			promptCounter(countedObject.counter, count.number),
			promptVerb("buy", ["past"], "verb"),
		],
	}
}

function generateCausativePassiveDestination({ difficulty, random }) {
	const subject = pickWordKey(PATIENT_KEYS, "patient", difficulty, random)
	const agent = pickDistinctWordKey(AGENT_KEYS, "agent", difficulty, random, subject)
	const destination = pickWordKey(DESTINATION_KEYS, "destination", difficulty, random)

	return {
		prompt: sentence(
			`${subjectText(subject)} was made to go ${destinationText(
				destination,
			)} by ${objectText(agent)}`,
		),
		japaneseTranslation: [
			promptWord(subject, "は", "subject"),
			promptWord(agent, "に", "agent"),
			promptWord(destination, "に", "destination"),
			promptVerb("go", ["causative", "passive", "past"], "verb"),
		],
	}
}

function pickWordKey(keys, role, difficulty, random) {
	return pick(keys.filter((key) => canUseWord(key, role, difficulty)), random)
}

function pickDistinctWordKey(keys, role, difficulty, random, excludedKey) {
	const options = keys.filter((key) => key !== excludedKey && canUseWord(key, role, difficulty))

	return pick(options, random)
}

function canUseWord(key, role, difficulty) {
	const vocabularyWord = getLocalVocabularyWord(key)
	const roles = role === "describedSubject" ? ["object", "place", "destination"] : [role]

	return (
		roles.some((allowedRole) => vocabularyWord.roles.includes(allowedRole)) &&
		DIFFICULTY_ORDER.indexOf(vocabularyWord.difficulty) <= DIFFICULTY_ORDER.indexOf(difficulty)
	)
}

function promptWord(key, particle, role) {
	return {
		key,
		role,
		...word(key, particle),
	}
}

function promptVerb(key, conjugation, role) {
	return {
		key,
		role,
		...(conjugation?.length ? conjugatedWord(key, null, conjugation) : word(key)),
	}
}

function promptCounter(key, number) {
	return {
		key,
		role: "counter",
		...word(key, null, {
			form: {
				number,
			},
		}),
	}
}

function subjectText(key) {
	return getLocalVocabularyWord(key).english.subject
}

function describedSubjectText(key) {
	return getLocalVocabularyWord(key).english.subject
}

function objectText(key) {
	return getLocalVocabularyWord(key).english.object
}

function pluralObjectText(key) {
	return getLocalVocabularyWord(key).english.plural
}

function adjectiveText(key) {
	return getLocalVocabularyWord(key).english.predicate
}

function adverbText(key) {
	return getLocalVocabularyWord(key).english.adverb
}

function placeText(key) {
	return getLocalVocabularyWord(key).english.place
}

function destinationText(key) {
	return getLocalVocabularyWord(key).english.destination
}

function verbBase(key) {
	return getLocalVocabularyWord(key).english.base
}

function verbText(key, subjectKey, tense) {
	const verb = getLocalVocabularyWord(key).english
	if (tense === "past") return verb.past
	if (tense === "negative") {
		return `${usesThirdPersonSingular(subjectKey) ? "does" : "do"} not ${verb.base}`
	}

	return usesThirdPersonSingular(subjectKey) ? verb.present3 : verb.base
}

function usesThirdPersonSingular(key) {
	return Boolean(getLocalVocabularyWord(key).thirdPersonSingular)
}

function tenseToConjugation(tense) {
	if (tense === "past") return ["past"]
	if (tense === "negative") return ["negative"]

	return []
}

function sentence(text) {
	const trimmedText = text.trim()

	return `${trimmedText.charAt(0).toUpperCase()}${trimmedText.slice(1)}.`
}

function introduceSentenceMistake(words, difficulty, random) {
	const candidates = getMistakeCandidates(words, difficulty)
	if (candidates.length === 0) return words.map((wordData) => ({ ...wordData }))

	const selectedMistake = pick(candidates, random)

	return words.map((wordData, index) => {
		if (index !== selectedMistake.index) return { ...wordData }

		return selectedMistake.apply(wordData)
	})
}

function getMistakeCandidates(words, difficulty) {
	const particleCandidates = words
		.map((wordData, index) => ({ wordData, index }))
		.filter(({ wordData }) => wordData.particle && getWrongParticle(wordData))
		.sort(
			(a, b) => getMistakeRolePriority(a.wordData.role) - getMistakeRolePriority(b.wordData.role),
		)
		.map(({ wordData, index }) => ({
			index,
			apply: () => ({
				...wordData,
				particle: getWrongParticle(wordData),
			}),
		}))

	if (difficulty === "easy") return particleCandidates

	const wordCandidates = words
		.map((wordData, index) => ({ wordData, index }))
		.filter(({ wordData }) => getWrongWordKey(wordData))
		.map(({ wordData, index }) => ({
			index,
			apply: () => ({
				...word(getWrongWordKey(wordData), wordData.particle),
				key: getWrongWordKey(wordData),
				role: wordData.role,
				...(wordData.conjugation ? { conjugation: wordData.conjugation } : {}),
			}),
		}))

	return [...particleCandidates, ...wordCandidates]
}

function getMistakeRolePriority(role) {
	const priorityByRole = {
		object: 0,
		destination: 1,
		place: 2,
		agent: 3,
		companion: 4,
		weather: 5,
		subject: 6,
	}

	return priorityByRole[role] ?? 10
}

function getWrongParticle(wordData) {
	const wrongParticlesByRole = {
		subject: wordData.particle === "は" ? "が" : "は",
		object: wordData.particle === "を" ? "に" : "を",
		place: wordData.particle === "で" ? "に" : "で",
		destination: wordData.particle === "に" ? "を" : "に",
		agent: wordData.particle === "に" ? "と" : "に",
		companion: wordData.particle === "と" ? "に" : "と",
		weather: wordData.particle === "が" ? "は" : "が",
	}

	return wrongParticlesByRole[wordData.role]
}

function getWrongWordKey(wordData) {
	const wrongWordsByKey = {
		book: "sushi",
		sushi: "book",
		water: "tea",
		tea: "water",
		japanese: "book",
		movie: "book",
		letter: "newspaper",
		newspaper: "letter",
		rice: "sushi",
		school: "station",
		station: "school",
		library: "home",
		home: "library",
		room: "school",
		store: "library",
		park: "school",
		company: "school",
		hospital: "library",
		movieTheater: "school",
		new: "old",
		old: "new",
		big: "small",
		small: "big",
		quiet: "simple",
		simple: "quiet",
		quickly: "slowly",
		slowly: "quickly",
		well: "sometimes",
		sometimes: "well",
		eat: "drink",
		drink: "eat",
		read: "write",
		write: "read",
		study: "read",
		buy: "read",
		watch: "read",
		speak: "study",
		praise: "read",
		go: "come",
	}

	return wrongWordsByKey[wordData.key]
}

function scrambleWords(words) {
	const indexesByLength = {
		3: [1, 2, 0],
		4: [1, 3, 0, 2],
		5: [1, 3, 4, 0, 2],
		6: [1, 2, 5, 0, 3, 4],
	}
	const indexes =
		indexesByLength[words.length] || words.map((_, index) => (index + 1) % words.length)

	return indexes.map((index) => ({ ...words[index] }))
}

function stripOutputMetadata(words) {
	return words.map(({ key, role, ...wordData }) => ({ ...wordData }))
}

function resolveDifficulty(difficulty) {
	return SENTENCE_FRAMES_BY_DIFFICULTY[difficulty] ? difficulty : "easy"
}

function pick(items, random) {
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error("Cannot pick from an empty prompt list.")
	}

	const index = Math.min(items.length - 1, Math.floor(random() * items.length))

	return items[index]
}
