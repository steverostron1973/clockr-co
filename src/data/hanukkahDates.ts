/**
 * First day of Hanukkah (25 Kislev) on the Hebrew lunisolar calendar.
 * The first candle is lit at sundown the evening before each listed date.
 */
export interface HanukkahDate {
	/** Gregorian calendar year */
	year: number;
	/** Gregorian month (0 = January) */
	month: number;
	/** Day of month */
	day: number;
}

export const hanukkahDates: HanukkahDate[] = [
	{ year: 2026, month: 11, day: 4 },
	{ year: 2027, month: 11, day: 24 },
	{ year: 2028, month: 11, day: 12 },
	{ year: 2029, month: 11, day: 1 },
	{ year: 2030, month: 11, day: 20 },
	{ year: 2031, month: 11, day: 9 },
	{ year: 2032, month: 10, day: 27 },
	{ year: 2033, month: 11, day: 16 },
	{ year: 2034, month: 11, day: 6 },
	{ year: 2035, month: 11, day: 25 },
];

export function getHanukkahDate(entry: HanukkahDate): Date {
	return new Date(entry.year, entry.month, entry.day, 0, 0, 0, 0);
}

export function getNextHanukkah(now = new Date()): HanukkahDate & { date: Date } {
	const sorted = [...hanukkahDates].sort(
		(a, b) => getHanukkahDate(a).getTime() - getHanukkahDate(b).getTime(),
	);

	for (const entry of sorted) {
		const date = getHanukkahDate(entry);
		if (now.getTime() < date.getTime()) {
			return { ...entry, date };
		}
	}

	const last = sorted[sorted.length - 1];
	return { ...last, date: getHanukkahDate(last) };
}

export function formatHanukkahDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/** Serializable dates for client-side countdown scripts */
export function getHanukkahDatesForClient(): HanukkahDate[] {
	return hanukkahDates.map(({ year, month, day }) => ({ year, month, day }));
}
