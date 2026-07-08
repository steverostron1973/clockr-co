/**
 * Hijri ↔ Gregorian conversion using the Umm al-Qura calendar
 * (@tabby_ai/hijri-converter, based on the mhalshehri/hijri-converter tables).
 *
 * This is an astronomical/tabular approximation aligned with Saudi Arabia's
 * official civil calendar. Locally observed dates may differ by ±1 day
 * depending on moon sighting.
 *
 * Verified reference pairs (Umm al-Qura / aladhan.com):
 * - 1 Muharram 1448 AH ↔ 16 June 2026 (Islamic New Year)
 * - 1 Ramadan 1447 AH ↔ 18 February 2026
 * - 1 Shawwal 1447 AH ↔ 20 March 2026 (Eid al-Fitr)
 * - 10 Dhu al-Hijjah 1447 AH ↔ 27 May 2026 (Eid al-Adha)
 * - 12 Muharram 1448 AH ↔ 27 June 2026
 * - 23 Muharram 1448 AH ↔ 8 July 2026
 */
import {
	gregorianToHijri,
	hijriToGregorian,
} from '@tabby_ai/hijri-converter';

/** Pairs used to sanity-check conversions (Hijri → expected Gregorian). */
export const HIJRI_REFERENCE_PAIRS: {
	label: string;
	hijri: HijriDateParts;
	gregorian: GregorianDateParts;
}[] = [
	{
		label: 'Islamic New Year 1448 AH',
		hijri: { year: 1448, month: 1, day: 1 },
		gregorian: { year: 2026, month: 6, day: 16 },
	},
	{
		label: 'Ramadan 1447 AH begins',
		hijri: { year: 1447, month: 9, day: 1 },
		gregorian: { year: 2026, month: 2, day: 18 },
	},
	{
		label: 'Eid al-Fitr 1447 AH',
		hijri: { year: 1447, month: 10, day: 1 },
		gregorian: { year: 2026, month: 3, day: 20 },
	},
	{
		label: 'Eid al-Adha 1447 AH',
		hijri: { year: 1447, month: 12, day: 10 },
		gregorian: { year: 2026, month: 5, day: 27 },
	},
	{
		label: '12 Muharram 1448 AH',
		hijri: { year: 1448, month: 1, day: 12 },
		gregorian: { year: 2026, month: 6, day: 27 },
	},
	{
		label: '23 Muharram 1448 AH',
		hijri: { year: 1448, month: 1, day: 23 },
		gregorian: { year: 2026, month: 7, day: 8 },
	},
];

export interface HijriDateParts {
	year: number;
	month: number;
	day: number;
}

export interface GregorianDateParts {
	year: number;
	month: number;
	day: number;
}

export function startOfLocalDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function gregorianDateToHijri(date: Date): HijriDateParts {
	const local = startOfLocalDay(date);
	return gregorianToHijri({
		year: local.getFullYear(),
		month: local.getMonth() + 1,
		day: local.getDate(),
	});
}

export function hijriPartsToGregorian(parts: HijriDateParts): Date {
	const g = hijriToGregorian(parts);
	return new Date(g.year, g.month - 1, g.day);
}

export function isValidHijriParts(parts: HijriDateParts): boolean {
	try {
		hijriToGregorian(parts);
		return true;
	} catch {
		return false;
	}
}

export function getHijriMonthLength(year: number, month: number): number {
	try {
		hijriToGregorian({ year, month, day: 30 });
		return 30;
	} catch {
		return 29;
	}
}

export const HIJRI_MONTHS = [
	{ num: 1, name: 'Muharram' },
	{ num: 2, name: 'Safar' },
	{ num: 3, name: "Rabi' al-Awwal" },
	{ num: 4, name: "Rabi' al-Thani" },
	{ num: 5, name: 'Jumada al-Awwal' },
	{ num: 6, name: 'Jumada al-Thani' },
	{ num: 7, name: 'Rajab' },
	{ num: 8, name: "Sha'ban" },
	{ num: 9, name: 'Ramadan' },
	{ num: 10, name: 'Shawwal' },
	{ num: 11, name: "Dhu al-Qi'dah" },
	{ num: 12, name: 'Dhu al-Hijjah' },
] as const;

export function formatHijriLong(parts: HijriDateParts): string {
	const monthName = HIJRI_MONTHS[parts.month - 1]?.name ?? `Month ${parts.month}`;
	return `${parts.day} ${monthName} ${parts.year} AH`;
}

export function formatGregorianLong(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export function gregorianPartsToDate(parts: GregorianDateParts): Date {
	return new Date(parts.year, parts.month - 1, parts.day);
}

/** Returns true when all reference pairs round-trip correctly. */
export function verifyHijriReferencePairs(): boolean {
	return HIJRI_REFERENCE_PAIRS.every(({ hijri, gregorian }) => {
		const fromHijri = hijriToGregorian(hijri);
		const hijriOk =
			fromHijri.year === gregorian.year &&
			fromHijri.month === gregorian.month &&
			fromHijri.day === gregorian.day;

		const fromGregorian = gregorianToHijri(gregorian);
		const gregorianOk =
			fromGregorian.year === hijri.year &&
			fromGregorian.month === hijri.month &&
			fromGregorian.day === hijri.day;

		return hijriOk && gregorianOk;
	});
}
