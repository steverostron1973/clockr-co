/**
 * Hebrew ↔ Gregorian conversion using @hebcal/core (hebcal.com).
 *
 * Verified reference pairs (hebcal.com, chabad.org):
 * - 23 Tamuz 5786 ↔ 8 July 2026
 * - 1 Tishrei 5787 ↔ 12 September 2026 (Rosh Hashana)
 * - 25 Kislev 5787 ↔ 5 December 2026
 */
import { HDate, months } from '@hebcal/core';
import { formatGregorianLong, startOfLocalDay } from './hijriConversion';

export { formatGregorianLong, startOfLocalDay };

export const HEBREW_YEAR_MIN = 3000;
export const HEBREW_YEAR_MAX = 5999;

/** Pairs used to sanity-check conversions (Hebrew → expected Gregorian). */
export const HEBREW_REFERENCE_PAIRS: {
	label: string;
	hebrew: HebrewDateParts;
	gregorian: GregorianDateParts;
}[] = [
	{
		label: '23 Tamuz 5786',
		hebrew: { year: 5786, month: months.TAMUZ, day: 23 },
		gregorian: { year: 2026, month: 7, day: 8 },
	},
	{
		label: 'Rosh Hashana 5787',
		hebrew: { year: 5787, month: months.TISHREI, day: 1 },
		gregorian: { year: 2026, month: 9, day: 12 },
	},
	{
		label: '25 Kislev 5787',
		hebrew: { year: 5787, month: months.KISLEV, day: 25 },
		gregorian: { year: 2026, month: 12, day: 5 },
	},
];

export interface HebrewDateParts {
	year: number;
	month: number;
	day: number;
}

export interface GregorianDateParts {
	year: number;
	month: number;
	day: number;
}

const CIVIL_MONTH_NUMS_LEAP = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6];
const CIVIL_MONTH_NUMS_REGULAR = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

export function isHebrewLeapYear(year: number): boolean {
	return new HDate(1, months.TISHREI, year).isLeapYear();
}

export function getCivilMonthOrder(leap: boolean): number[] {
	return leap ? CIVIL_MONTH_NUMS_LEAP : CIVIL_MONTH_NUMS_REGULAR;
}

export function getHebrewMonthsForYear(year: number): {
	num: number;
	name: string;
	days: number;
}[] {
	const leap = isHebrewLeapYear(year);
	return getCivilMonthOrder(leap).map((m) => {
		const hd = new HDate(1, m, year);
		return {
			num: m,
			name: hd.getMonthName(),
			days: hd.daysInMonth(),
		};
	});
}

export function getHebrewMonthLength(year: number, month: number): number {
	return new HDate(1, month, year).daysInMonth();
}

export function gregorianDateToHebrew(date: Date): HebrewDateParts {
	const local = startOfLocalDay(date);
	const hd = new HDate(local);
	return {
		year: hd.getFullYear(),
		month: hd.getMonth(),
		day: hd.getDate(),
	};
}

export function hebrewPartsToGregorian(parts: HebrewDateParts): Date {
	const hd = new HDate(parts.day, parts.month, parts.year);
	const g = hd.greg();
	return new Date(g.getFullYear(), g.getMonth(), g.getDate());
}

export function isValidHebrewParts(parts: HebrewDateParts): boolean {
	if (
		parts.year < HEBREW_YEAR_MIN ||
		parts.year > HEBREW_YEAR_MAX ||
		parts.day < 1 ||
		parts.day > 30
	) {
		return false;
	}

	try {
		const hd = new HDate(parts.day, parts.month, parts.year);
		return (
			hd.getFullYear() === parts.year &&
			hd.getMonth() === parts.month &&
			hd.getDate() === parts.day
		);
	} catch {
		return false;
	}
}

export function formatHebrewLong(parts: HebrewDateParts): string {
	const hd = new HDate(parts.day, parts.month, parts.year);
	return `${parts.day} ${hd.getMonthName()} ${parts.year}`;
}

/** Normalize month when year changes (e.g. Adar II only exists in leap years). */
export function normalizeHebrewMonthForYear(
	year: number,
	month: number,
): number {
	const order = getCivilMonthOrder(isHebrewLeapYear(year));
	if (order.includes(month)) {
		return month;
	}
	return order[order.length - 1] ?? months.ADAR;
}

/** Returns true when all reference pairs round-trip correctly. */
export function verifyHebrewReferencePairs(): boolean {
	return HEBREW_REFERENCE_PAIRS.every(({ hebrew, gregorian }) => {
		const fromHebrew = hebrewPartsToGregorian(hebrew);
		const hebrewOk =
			fromHebrew.getFullYear() === gregorian.year &&
			fromHebrew.getMonth() + 1 === gregorian.month &&
			fromHebrew.getDate() === gregorian.day;

		const fromGregorian = gregorianDateToHebrew(
			new Date(gregorian.year, gregorian.month - 1, gregorian.day),
		);
		const gregorianOk =
			fromGregorian.year === hebrew.year &&
			fromGregorian.month === hebrew.month &&
			fromGregorian.day === hebrew.day;

		return hebrewOk && gregorianOk;
	});
}
