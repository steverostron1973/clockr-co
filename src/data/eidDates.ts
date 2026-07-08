/**
 * Estimated Eid dates from the Umm al-Qura calendar (Saudi official).
 * Eid al-Fitr: 1 Shawwal. Eid al-Adha: 10 Dhu al-Hijjah.
 * Actual dates may vary by ±1 day depending on local moon sighting.
 */
export type EidType = 'fitr' | 'adha';

export interface EidDate {
	/** Gregorian calendar year */
	year: number;
	/** Which Eid */
	type: EidType;
	/** Gregorian month (0 = January) */
	month: number;
	/** Day of month */
	day: number;
}

export const eidAlFitrDates: Omit<EidDate, 'type'>[] = [
	{ year: 2026, month: 2, day: 20 },
	{ year: 2027, month: 2, day: 9 },
	{ year: 2028, month: 1, day: 26 },
	{ year: 2029, month: 1, day: 14 },
	{ year: 2030, month: 1, day: 4 },
	{ year: 2031, month: 0, day: 24 },
	{ year: 2032, month: 0, day: 14 },
	{ year: 2033, month: 0, day: 2 },
	{ year: 2033, month: 11, day: 23 },
	{ year: 2034, month: 11, day: 12 },
	{ year: 2035, month: 11, day: 1 },
];

export const eidAlAdhaDates: Omit<EidDate, 'type'>[] = [
	{ year: 2026, month: 4, day: 27 },
	{ year: 2027, month: 4, day: 16 },
	{ year: 2028, month: 4, day: 5 },
	{ year: 2029, month: 3, day: 24 },
	{ year: 2030, month: 3, day: 13 },
	{ year: 2031, month: 3, day: 2 },
	{ year: 2032, month: 2, day: 22 },
	{ year: 2033, month: 2, day: 12 },
	{ year: 2034, month: 2, day: 1 },
	{ year: 2035, month: 1, day: 19 },
];

export const allEidDates: EidDate[] = [
	...eidAlFitrDates.map((entry) => ({ ...entry, type: 'fitr' as const })),
	...eidAlAdhaDates.map((entry) => ({ ...entry, type: 'adha' as const })),
];

export function getEidDate(entry: EidDate): Date {
	return new Date(entry.year, entry.month, entry.day, 0, 0, 0, 0);
}

export function getEidLabel(type: EidType): string {
	return type === 'fitr' ? 'Eid al-Fitr' : 'Eid al-Adha';
}

export function getEidHeading(type: EidType): string {
	return type === 'fitr' ? 'Days Until Eid al-Fitr' : 'Days Until Eid al-Adha';
}

export function getNextEid(now = new Date()): EidDate & { date: Date } {
	const sorted = [...allEidDates].sort(
		(a, b) => getEidDate(a).getTime() - getEidDate(b).getTime(),
	);

	for (const entry of sorted) {
		const date = getEidDate(entry);
		if (now.getTime() < date.getTime()) {
			return { ...entry, date };
		}
	}

	const last = sorted[sorted.length - 1];
	return { ...last, date: getEidDate(last) };
}

export function getNextEidByType(
	type: EidType,
	now = new Date(),
): EidDate & { date: Date } {
	const dates =
		type === 'fitr'
			? eidAlFitrDates.map((entry) => ({ ...entry, type: 'fitr' as const }))
			: eidAlAdhaDates.map((entry) => ({ ...entry, type: 'adha' as const }));

	const sorted = [...dates].sort(
		(a, b) => getEidDate(a).getTime() - getEidDate(b).getTime(),
	);

	for (const entry of sorted) {
		const date = getEidDate(entry);
		if (now.getTime() < date.getTime()) {
			return { ...entry, date };
		}
	}

	const last = sorted[sorted.length - 1];
	return { ...last, date: getEidDate(last) };
}

export function formatEidDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/** Serializable dates for client-side countdown scripts */
export function getEidDatesForClient(): EidDate[] {
	return allEidDates.map(({ year, type, month, day }) => ({
		year,
		type,
		month,
		day,
	}));
}
