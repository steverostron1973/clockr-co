export type CategoryId =
	| 'holidays'
	| 'birthdays'
	| 'timezones'
	| 'history'
	| 'milestones'
	| 'work'
	| 'religious'
	| 'seasons';

export interface Category {
	id: CategoryId;
	name: string;
	description: string;
	emoji: string;
	from: string;
	to: string;
	href: string;
}

export const categoryGradients: Record<
	CategoryId,
	{ from: string; to: string }
> = {
	holidays: { from: '#FF5C4D', to: '#FF9A3C' },
	birthdays: { from: '#8B5CF6', to: '#EC4899' },
	timezones: { from: '#00E5C4', to: '#0099FF' },
	history: { from: '#D97706', to: '#F59E0B' },
	milestones: { from: '#A855F7', to: '#FF5C4D' },
	work: { from: '#475569', to: '#3B82F6' },
	religious: { from: '#E8937A', to: '#C9956C' },
	seasons: { from: '#2D6A4F', to: '#74B49B' },
};

/** Full CSS gradient string — same 135deg pattern used on tool pages (e.g. #8b5cf6 → #ec4899). */
export function getCategoryGradient(from: string, to: string): string {
	return `linear-gradient(135deg, ${from}, ${to})`;
}

function hexToRgbChannels(hex: string): string {
	const normalized = hex.replace('#', '');
	const full =
		normalized.length === 3
			? normalized
					.split('')
					.map((c) => c + c)
					.join('')
			: normalized;
	const value = Number.parseInt(full, 16);
	return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

export const categoryRgb = Object.fromEntries(
	(Object.keys(categoryGradients) as CategoryId[]).map((id) => [
		id,
		{
			from: hexToRgbChannels(categoryGradients[id].from),
			to: hexToRgbChannels(categoryGradients[id].to),
		},
	]),
) as Record<CategoryId, { from: string; to: string }>;

export const categories: Category[] = [
	{
		id: 'holidays',
		name: 'Holiday Countdowns',
		description: "Christmas, Mother's Day, Father's Day, Halloween, New Year and more",
		emoji: '🎄',
		...categoryGradients.holidays,
		href: '/holiday-countdowns',
	},
	{
		id: 'birthdays',
		name: 'Age & Birthdays',
		description: 'How old are you, exactly?',
		emoji: '🎂',
		...categoryGradients.birthdays,
		href: '/birthdays',
	},
	{
		id: 'timezones',
		name: 'Time Zones',
		description: 'What time is it anywhere in the world',
		emoji: '🌍',
		...categoryGradients.timezones,
		href: '/time-zones',
	},
	{
		id: 'history',
		name: 'This Day in History',
		description: 'What happened on this exact date',
		emoji: '📜',
		...categoryGradients.history,
		href: '/this-day-in-history',
	},
	{
		id: 'milestones',
		name: 'Milestones',
		description: 'Your 10,000th day and beyond',
		emoji: '⚡',
		...categoryGradients.milestones,
		href: '/milestones',
	},
	{
		id: 'work',
		name: 'Work & Business',
		description: 'Hours, deadlines and working days',
		emoji: '💼',
		...categoryGradients.work,
		href: '/work',
	},
	{
		id: 'seasons',
		name: 'Seasons',
		description: 'Solstices, equinoxes and season countdowns',
		emoji: '🍂',
		...categoryGradients.seasons,
		href: '/seasons',
	},
	{
		id: 'religious',
		name: 'Religious Calendars',
		description: 'Ramadan, Diwali, Easter and more',
		emoji: '🕌',
		...categoryGradients.religious,
		href: '/religious',
	},
];
