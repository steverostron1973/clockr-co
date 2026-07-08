import { categories, type CategoryId } from './categories';

export interface SiteTool {
	name: string;
	href: string;
	emoji: string;
	categoryId: CategoryId;
}

/** Category order for the homepage "All tools" section. */
export const allToolsCategoryOrder: CategoryId[] = [
	'holidays',
	'birthdays',
	'timezones',
	'work',
	'seasons',
	'milestones',
	'religious',
	'history',
];

/**
 * Every tool page on the site, grouped by category.
 * Category assignments match the category index pages (holiday-countdowns, age-birthdays, etc.).
 */
export const siteTools: SiteTool[] = [
	// Holiday Countdowns
	{
		name: 'Back to School Countdown',
		href: '/days-until-back-to-school',
		emoji: '🎒',
		categoryId: 'holidays',
	},
	{
		name: 'Black Friday Countdown',
		href: '/days-until-black-friday',
		emoji: '🛍️',
		categoryId: 'holidays',
	},
	{
		name: 'Boxing Day Countdown',
		href: '/days-until-boxing-day',
		emoji: '🎁',
		categoryId: 'holidays',
	},
	{
		name: 'Create Your Own Countdown',
		href: '/create-countdown',
		emoji: '✨',
		categoryId: 'holidays',
	},
	{
		name: 'Days Until Bonfire Night',
		href: '/days-until-bonfire-night',
		emoji: '🔥',
		categoryId: 'holidays',
	},
	{
		name: 'Days Until Christmas',
		href: '/days-until-christmas',
		emoji: '🎄',
		categoryId: 'holidays',
	},
	{
		name: 'Days Until Halloween',
		href: '/days-until-halloween',
		emoji: '🎃',
		categoryId: 'holidays',
	},
	{
		name: 'Days Until New Year',
		href: '/days-until-new-year',
		emoji: '🎆',
		categoryId: 'holidays',
	},
	{
		name: "Days Until Valentine's Day",
		href: '/days-until-valentines',
		emoji: '💝',
		categoryId: 'holidays',
	},
	{
		name: "Father's Day Countdown",
		href: '/days-until-fathers-day',
		emoji: '👔',
		categoryId: 'holidays',
	},
	{
		name: 'Fun & Unofficial Holidays',
		href: '/fun-holidays',
		emoji: '🎉',
		categoryId: 'holidays',
	},
	{
		name: "Mother's Day Countdown",
		href: '/days-until-mothers-day',
		emoji: '💐',
		categoryId: 'holidays',
	},
	{
		name: "St Patrick's Day Countdown",
		href: '/days-until-st-patricks-day',
		emoji: '☘️',
		categoryId: 'holidays',
	},
	{
		name: 'Thanksgiving Countdown',
		href: '/days-until-thanksgiving',
		emoji: '🦃',
		categoryId: 'holidays',
	},
	{
		name: 'Your Countdown',
		href: '/countdown',
		emoji: '⏳',
		categoryId: 'holidays',
	},

	// Age & Birthdays
	{
		name: 'Age Calculator',
		href: '/age-calculator',
		emoji: '🎂',
		categoryId: 'birthdays',
	},
	{
		name: 'Age Difference Calculator',
		href: '/age-difference-calculator',
		emoji: '👥',
		categoryId: 'birthdays',
	},
	{
		name: 'Age on Other Planets',
		href: '/age-on-other-planets',
		emoji: '🪐',
		categoryId: 'birthdays',
	},
	{
		name: 'Days Until Birthday',
		href: '/days-until-birthday',
		emoji: '🎈',
		categoryId: 'birthdays',
	},
	{
		name: 'Pregnancy Due Date Calculator',
		href: '/pregnancy-due-date-calculator',
		emoji: '👶',
		categoryId: 'birthdays',
	},
	{
		name: 'Sleep Calculator',
		href: '/sleep-calculator',
		emoji: '😴',
		categoryId: 'birthdays',
	},
	{
		name: 'Zodiac Sign Finder',
		href: '/zodiac-sign-finder',
		emoji: '✨',
		categoryId: 'birthdays',
	},

	// Time Zones
	{
		name: 'Time Difference',
		href: '/time-difference',
		emoji: '⏳',
		categoryId: 'timezones',
	},
	{
		name: 'Time Zone Abbreviations',
		href: '/timezone-abbreviations',
		emoji: '🔤',
		categoryId: 'timezones',
	},
	{
		name: 'Time Zone Map',
		href: '/timezone-map',
		emoji: '🗺️',
		categoryId: 'timezones',
	},
	{
		name: 'Time Zone Meeting Planner',
		href: '/time-zone-meeting-planner',
		emoji: '📅',
		categoryId: 'timezones',
	},
	{
		name: 'Timezone Converter',
		href: '/timezone-converter',
		emoji: '🌐',
		categoryId: 'timezones',
	},
	{
		name: 'Unix Timestamp Converter',
		href: '/unix-timestamp',
		emoji: '💻',
		categoryId: 'timezones',
	},
	{
		name: 'UTC/GMT Converter',
		href: '/utc-gmt-converter',
		emoji: '🕐',
		categoryId: 'timezones',
	},
	{
		name: 'World Clock',
		href: '/world-clock',
		emoji: '🌍',
		categoryId: 'timezones',
	},

	// Work & Business
	{
		name: 'Business Days Calculator',
		href: '/business-days',
		emoji: '💼',
		categoryId: 'work',
	},
	{
		name: 'Countdown Timer',
		href: '/countdown-timer',
		emoji: '⏱️',
		categoryId: 'work',
	},
	{
		name: 'Date Calculator',
		href: '/date-calculator',
		emoji: '📅',
		categoryId: 'work',
	},
	{
		name: 'Day of the Week Calculator',
		href: '/day-of-week',
		emoji: '📆',
		categoryId: 'work',
	},
	{
		name: 'Invoice Due Date Calculator',
		href: '/invoice-due-date-calculator',
		emoji: '🧾',
		categoryId: 'work',
	},
	{
		name: 'Overtime Calculator',
		href: '/overtime-calculator',
		emoji: '⏱️',
		categoryId: 'work',
	},
	{
		name: 'Pomodoro Timer',
		href: '/pomodoro-timer',
		emoji: '🍅',
		categoryId: 'work',
	},
	{
		name: 'Printable Calendar Generator',
		href: '/printable-calendar',
		emoji: '📅',
		categoryId: 'work',
	},
	{
		name: 'Project Deadline Calculator',
		href: '/project-deadline-calculator',
		emoji: '📌',
		categoryId: 'work',
	},
	{
		name: 'Quarter Calculator',
		href: '/quarter-calculator',
		emoji: '📊',
		categoryId: 'work',
	},
	{
		name: 'Random Date Generator',
		href: '/random-date-generator',
		emoji: '🎲',
		categoryId: 'work',
	},
	{
		name: 'Stopwatch',
		href: '/stopwatch',
		emoji: '⏱️',
		categoryId: 'work',
	},
	{
		name: 'Week Number Calculator',
		href: '/week-number-calculator',
		emoji: '📆',
		categoryId: 'work',
	},
	{
		name: 'Work Hours Calculator',
		href: '/work-hours-calculator',
		emoji: '🕒',
		categoryId: 'work',
	},

	// Seasons
	{
		name: 'Clock Change Countdown',
		href: '/clock-change-countdown',
		emoji: '⏰',
		categoryId: 'seasons',
	},
	{
		name: 'Daylight Hours Calculator',
		href: '/daylight-hours-calculator',
		emoji: '🌅',
		categoryId: 'seasons',
	},
	{
		name: 'Leap Year Checker',
		href: '/leap-year',
		emoji: '📆',
		categoryId: 'seasons',
	},
	{
		name: 'Moon Phase Calculator',
		href: '/moon-phase-calculator',
		emoji: '🌙',
		categoryId: 'seasons',
	},
	{
		name: 'Season Countdown',
		href: '/season-countdown',
		emoji: '🍂',
		categoryId: 'seasons',
	},
	{
		name: 'Sun Calculator',
		href: '/sun-calculator',
		emoji: '☀️',
		categoryId: 'seasons',
	},
	{
		name: 'Year Progress',
		href: '/year-progress',
		emoji: '📊',
		categoryId: 'seasons',
	},

	// Milestones
	{
		name: 'Anniversary Calculator',
		href: '/anniversary-calculator',
		emoji: '💍',
		categoryId: 'milestones',
	},
	{
		name: "How Many Days Until I'm X",
		href: '/days-until-im-x',
		emoji: '🎯',
		categoryId: 'milestones',
	},
	{
		name: 'Retirement Countdown Calculator',
		href: '/retirement-countdown-calculator',
		emoji: '🏖️',
		categoryId: 'milestones',
	},
	{
		name: 'What Generation Am I',
		href: '/what-generation',
		emoji: '🧬',
		categoryId: 'milestones',
	},
	{
		name: 'Your Life in Numbers',
		href: '/life-in-numbers',
		emoji: '⚡',
		categoryId: 'milestones',
	},

	// Religious Calendars
	{
		name: 'Days Until Diwali',
		href: '/days-until-diwali',
		emoji: '🪔',
		categoryId: 'religious',
	},
	{
		name: 'Days Until Easter',
		href: '/days-until-easter',
		emoji: '🐣',
		categoryId: 'religious',
	},
	{
		name: 'Days Until Eid',
		href: '/days-until-eid',
		emoji: '🌙',
		categoryId: 'religious',
	},
	{
		name: 'Days Until Hanukkah',
		href: '/days-until-hanukkah',
		emoji: '🕎',
		categoryId: 'religious',
	},
	{
		name: 'Days Until Ramadan',
		href: '/days-until-ramadan',
		emoji: '🌙',
		categoryId: 'religious',
	},
	{
		name: 'Hebrew Calendar Converter',
		href: '/hebrew-calendar-converter',
		emoji: '✡️',
		categoryId: 'religious',
	},
	{
		name: 'Hijri Calendar Converter',
		href: '/hijri-calendar-converter',
		emoji: '📅',
		categoryId: 'religious',
	},

	// This Day in History
	{
		name: 'This Day in History',
		href: '/this-day-in-history',
		emoji: '📜',
		categoryId: 'history',
	},
];

export interface AllToolsSection {
	id: CategoryId;
	name: string;
	tools: SiteTool[];
}

export function getAllToolsSections(): AllToolsSection[] {
	const categoryNames = Object.fromEntries(
		categories.map((c) => [c.id, c.name]),
	) as Record<CategoryId, string>;

	return allToolsCategoryOrder.map((id) => ({
		id,
		name: categoryNames[id],
		tools: siteTools
			.filter((tool) => tool.categoryId === id)
			.sort((a, b) => a.name.localeCompare(b.name, 'en')),
	}));
}
