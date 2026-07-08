/**
 * Hijri ↔ Gregorian conversion using the Umm al-Qura tabular calendar
 * (@tabby_ai/hijri-converter). This is an astronomical/tabular approximation;
 * locally observed dates may differ by a day depending on moon sighting.
 */
import {
	gregorianToHijri,
	hijriToGregorian,
} from '@tabby_ai/hijri-converter';

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
