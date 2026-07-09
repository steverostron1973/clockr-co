import { allWorldClockCities } from '../data/worldClockSearchCities';
import type { WorldClockCity } from '../data/worldClockSearchCities';
import { PREFERRED_CITY_FOR_ZONE } from '../data/preferredCityForZone';

export const sortedCities = [...allWorldClockCities].sort((a, b) =>
	a.city.localeCompare(b.city),
);

export function findCityForTimezone(timezone: string): WorldClockCity {
	const preferred = PREFERRED_CITY_FOR_ZONE[timezone];
	if (preferred) {
		const match = sortedCities.find(
			(c) => `${c.city}, ${c.country}` === preferred,
		);
		if (match) return match;
	}
	const matches = sortedCities.filter((c) => c.timezone === timezone);
	if (matches.length > 0) return matches[0];
	const label = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
	return {
		city: label,
		country: '',
		timezone,
		flag: '🌐',
	};
}

export function wallClockToUtc(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	timeZone: string,
): Date {
	let date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});

	for (let i = 0; i < 2; i++) {
		const parts = formatter.formatToParts(date);
		const get = (type: string) =>
			parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
		const tzYear = get('year');
		const tzMonth = get('month');
		const tzDay = get('day');
		const tzHour = get('hour');
		const tzMinute = get('minute');
		const desired = Date.UTC(year, month - 1, day, hour, minute);
		const actual = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute);
		date = new Date(date.getTime() + (desired - actual));
	}

	return date;
}

export function getTimezoneOffsetLabel(
	cityName: string,
	timeZone: string,
	date: Date,
): string {
	const offsetFmt = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		timeZoneName: 'shortOffset',
	});
	const abbrFmt = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		timeZoneName: 'short',
	});
	const longFmt = new Intl.DateTimeFormat('en-US', {
		timeZone,
		timeZoneName: 'long',
	});

	const offset = (
		offsetFmt.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ??
		''
	).replace('GMT', 'UTC');
	const abbr =
		abbrFmt.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ??
		'';
	const longName =
		longFmt.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ??
		'';
	const dstActive = /daylight/i.test(longName);

	let label = `${cityName} is currently ${offset}`;
	if (abbr) label += ` (${abbr})`;
	if (dstActive) label += ' — daylight saving time is active';

	return label;
}

export function formatDateString(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function getLocalParts(
	date: Date,
	timeZone: string,
): {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
} {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}).formatToParts(date);

	const get = (type: string) =>
		parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute'),
	};
}

export function getOffsetMinutes(timeZone: string, date: Date): number {
	const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
	const tz = new Date(date.toLocaleString('en-US', { timeZone }));
	return (tz.getTime() - utc.getTime()) / 60000;
}

export function formatDuration(totalMinutes: number): string {
	const hours = Math.floor(Math.abs(totalMinutes) / 60);
	const mins = Math.abs(totalMinutes) % 60;
	const parts: string[] = [];
	if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
	if (mins > 0) parts.push(`${mins} minute${mins === 1 ? '' : 's'}`);
	return parts.join(' ') || '0 hours';
}

export function formatTimeDifferenceSentence(
	fromCity: string,
	toCity: string,
	fromTz: string,
	toTz: string,
	date: Date = new Date(),
): string {
	const diffMinutes =
		getOffsetMinutes(toTz, date) - getOffsetMinutes(fromTz, date);
	if (diffMinutes === 0) {
		return `${toCity} is the same time as ${fromCity}`;
	}
	if (diffMinutes < 0) {
		return `${toCity} is ${formatDuration(diffMinutes)} behind ${fromCity}`;
	}
	return `${toCity} is ${formatDuration(diffMinutes)} ahead of ${fromCity}`;
}

export interface WorkingHoursOverlap {
	fromLabel: string;
	toLabel: string;
}

export function findWorkingHoursOverlap(
	fromCity: string,
	toCity: string,
	fromTz: string,
	toTz: string,
	date: Date = new Date(),
): WorkingHoursOverlap | null {
	const anchor = getLocalParts(date, fromTz);
	const ranges: Array<{ startMinutes: number; endMinutes: number }> = [];
	let rangeStart: number | null = null;
	let lastMatching: number | null = null;

	for (let minutes = 9 * 60; minutes < 18 * 60; minutes += 30) {
		const hour = Math.floor(minutes / 60);
		const minute = minutes % 60;
		const instant = wallClockToUtc(
			anchor.year,
			anchor.month,
			anchor.day,
			hour,
			minute,
			fromTz,
		);
		const toParts = getLocalParts(instant, toTz);
		const inToWorkingHours =
			toParts.hour >= 9 &&
			(toParts.hour < 18 || (toParts.hour === 18 && toParts.minute === 0));

		if (inToWorkingHours) {
			if (rangeStart === null) rangeStart = minutes;
			lastMatching = minutes;
		} else if (rangeStart !== null && lastMatching !== null) {
			ranges.push({ startMinutes: rangeStart, endMinutes: lastMatching + 30 });
			rangeStart = null;
			lastMatching = null;
		}
	}

	if (rangeStart !== null && lastMatching !== null) {
		ranges.push({ startMinutes: rangeStart, endMinutes: lastMatching + 30 });
	}

	if (ranges.length === 0) return null;

	const primary = ranges[0];
	const rangeStartInstant = wallClockToUtc(
		anchor.year,
		anchor.month,
		anchor.day,
		Math.floor(primary.startMinutes / 60),
		primary.startMinutes % 60,
		fromTz,
	);
	const rangeEndInstant = wallClockToUtc(
		anchor.year,
		anchor.month,
		anchor.day,
		Math.floor(primary.endMinutes / 60),
		primary.endMinutes % 60,
		fromTz,
	);
	const fromFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: fromTz,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
	const toFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: toTz,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});

	return {
		fromLabel: `${fromFormatter.format(rangeStartInstant)}–${fromFormatter.format(rangeEndInstant)} in ${fromCity}`,
		toLabel: `${toFormatter.format(rangeStartInstant)}–${toFormatter.format(rangeEndInstant)} in ${toCity}`,
	};
}

export function parseDateString(value: string): {
	year: number;
	month: number;
	day: number;
} {
	const [year, month, day] = value.split('-').map(Number);
	return { year, month, day };
}
