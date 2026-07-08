/**
 * Estimated 1 Ramadan start dates from the Umm al-Qura calendar (Saudi official).
 * Actual start may vary by ±1 day depending on local moon sighting.
 */
export interface RamadanStart {
	/** Gregorian calendar year */
	year: number;
	/** Hijri year (e.g. 1447 for Ramadan 2026) */
	hijriYear: number;
	/** Gregorian month (0 = January) */
	month: number;
	/** Day of month */
	day: number;
}

export const ramadanStartDates: RamadanStart[] = [
	{ year: 2026, hijriYear: 1447, month: 1, day: 18 },
	{ year: 2027, hijriYear: 1448, month: 1, day: 8 },
	{ year: 2028, hijriYear: 1449, month: 0, day: 28 },
	{ year: 2029, hijriYear: 1450, month: 0, day: 16 },
	{ year: 2030, hijriYear: 1451, month: 0, day: 5 },
	{ year: 2030, hijriYear: 1452, month: 11, day: 26 },
	{ year: 2031, hijriYear: 1453, month: 11, day: 15 },
	{ year: 2032, hijriYear: 1454, month: 11, day: 4 },
	{ year: 2033, hijriYear: 1455, month: 10, day: 23 },
	{ year: 2034, hijriYear: 1456, month: 10, day: 12 },
	{ year: 2035, hijriYear: 1457, month: 10, day: 1 },
];

export function getRamadanStartDate(entry: RamadanStart): Date {
	return new Date(entry.year, entry.month, entry.day, 0, 0, 0, 0);
}

export function getNextRamadanStart(now = new Date()): RamadanStart & { date: Date } {
	const sorted = [...ramadanStartDates].sort(
		(a, b) => getRamadanStartDate(a).getTime() - getRamadanStartDate(b).getTime(),
	);

	for (const entry of sorted) {
		const date = getRamadanStartDate(entry);
		if (now.getTime() < date.getTime()) {
			return { ...entry, date };
		}
	}

	const last = sorted[sorted.length - 1];
	return { ...last, date: getRamadanStartDate(last) };
}

export function formatRamadanDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/** Serializable dates for client-side countdown scripts */
export function getRamadanDatesForClient(): { year: number; hijriYear: number; month: number; day: number }[] {
	return ramadanStartDates.map(({ year, hijriYear, month, day }) => ({
		year,
		hijriYear,
		month,
		day,
	}));
}
