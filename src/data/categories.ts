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
	history: { from: '#FFC04D', to: '#FF9A3C' },
	milestones: { from: '#A855F7', to: '#FF5C4D' },
	work: { from: '#10B981', to: '#84CC16' },
	religious: { from: '#E8937A', to: '#C9956C' },
	seasons: { from: '#2D6A4F', to: '#74B49B' },
};

export const categories: Category[] = [
	{
		id: 'holidays',
		name: 'Holiday Countdowns',
		description: 'Christmas, Halloween, New Year and more',
		emoji: '🎄',
		...categoryGradients.holidays,
		href: '/countdowns',
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
		href: '/history',
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
