export const translateTemplates = [
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
