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

export function parseDateString(value: string): {
	year: number;
	month: number;
	day: number;
} {
	const [year, month, day] = value.split('-').map(Number);
	return { year, month, day };
}
