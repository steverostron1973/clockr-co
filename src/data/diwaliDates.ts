/**
 * Main Diwali dates (Kartik Amavasya / Lakshmi Puja) on the Hindu lunisolar calendar.
 * Regional panchang calculations may vary by a day in some areas.
 */
export interface DiwaliDate {
	/** Gregorian calendar year */
	year: number;
	/** Gregorian month (0 = January) */
	month: number;
	/** Day of month */
	day: number;
}

export const diwaliDates: DiwaliDate[] = [
	{ year: 2026, month: 10, day: 8 },
	{ year: 2027, month: 9, day: 29 },
	{ year: 2028, month: 9, day: 17 },
	{ year: 2029, month: 10, day: 5 },
	{ year: 2030, month: 9, day: 26 },
	{ year: 2031, month: 10, day: 14 },
	{ year: 2032, month: 10, day: 2 },
	{ year: 2033, month: 9, day: 22 },
	{ year: 2034, month: 10, day: 10 },
	{ year: 2035, month: 9, day: 30 },
];

export function getDiwaliDate(entry: DiwaliDate): Date {
	return new Date(entry.year, entry.month, entry.day, 0, 0, 0, 0);
}

export function getNextDiwali(now = new Date()): DiwaliDate & { date: Date } {
	const sorted = [...diwaliDates].sort(
		(a, b) => getDiwaliDate(a).getTime() - getDiwaliDate(b).getTime(),
	);

	for (const entry of sorted) {
		const date = getDiwaliDate(entry);
		if (now.getTime() < date.getTime()) {
			return { ...entry, date };
		}
	}

	const last = sorted[sorted.length - 1];
	return { ...last, date: getDiwaliDate(last) };
}

export function formatDiwaliDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/** Serializable dates for client-side countdown scripts */
export function getDiwaliDatesForClient(): DiwaliDate[] {
	return diwaliDates.map(({ year, month, day }) => ({ year, month, day }));
}
