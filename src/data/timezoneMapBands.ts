export interface TimezoneMapCity {
	name: string;
	country: string;
	timezone: string;
	flag: string;
}

export interface TimezoneMapBand {
	/** Offset from UTC in minutes (e.g. 330 = UTC+5:30). */
	offsetMinutes: number;
	label: string;
	regions: string;
	cities: TimezoneMapCity[];
}

/** Bands from UTC−12 through UTC+14, including common fractional offsets. */
export const TIMEZONE_MAP_BANDS: TimezoneMapBand[] = [
	{
		offsetMinutes: -720,
		label: 'UTC−12',
		regions: 'Baker Island, Howland Island (uninhabited US territories)',
		cities: [
			{ name: 'Baker Island', country: 'United States', timezone: 'Etc/GMT+12', flag: '🇺🇸' },
		],
	},
	{
		offsetMinutes: -660,
		label: 'UTC−11',
		regions: 'American Samoa, Niue, Midway Atoll',
		cities: [
			{ name: 'Pago Pago', country: 'American Samoa', timezone: 'Pacific/Pago_Pago', flag: '🇦🇸' },
			{ name: 'Alofi', country: 'Niue', timezone: 'Pacific/Niue', flag: '🇳🇺' },
		],
	},
	{
		offsetMinutes: -600,
		label: 'UTC−10',
		regions: 'Hawaii, French Polynesia (Tahiti), Cook Islands',
		cities: [
			{ name: 'Honolulu', country: 'United States', timezone: 'Pacific/Honolulu', flag: '🇺🇸' },
			{ name: 'Tahiti', country: 'French Polynesia', timezone: 'Pacific/Tahiti', flag: '🇵🇫' },
		],
	},
	{
		offsetMinutes: -540,
		label: 'UTC−9',
		regions: 'Alaska (most), Gambier Islands',
		cities: [
			{ name: 'Anchorage', country: 'United States', timezone: 'America/Anchorage', flag: '🇺🇸' },
			{ name: 'Juneau', country: 'United States', timezone: 'America/Juneau', flag: '🇺🇸' },
		],
	},
	{
		offsetMinutes: -480,
		label: 'UTC−8',
		regions: 'US & Canada Pacific, Baja California',
		cities: [
			{ name: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
			{ name: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', flag: '🇨🇦' },
			{ name: 'Tijuana', country: 'Mexico', timezone: 'America/Tijuana', flag: '🇲🇽' },
		],
	},
	{
		offsetMinutes: -420,
		label: 'UTC−7',
		regions: 'US & Canada Mountain, Arizona (no DST)',
		cities: [
			{ name: 'Denver', country: 'United States', timezone: 'America/Denver', flag: '🇺🇸' },
			{ name: 'Phoenix', country: 'United States', timezone: 'America/Phoenix', flag: '🇺🇸' },
			{ name: 'Calgary', country: 'Canada', timezone: 'America/Edmonton', flag: '🇨🇦' },
		],
	},
	{
		offsetMinutes: -360,
		label: 'UTC−6',
		regions: 'US & Canada Central, Mexico (most), Central America',
		cities: [
			{ name: 'Chicago', country: 'United States', timezone: 'America/Chicago', flag: '🇺🇸' },
			{ name: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽' },
			{ name: 'Guatemala City', country: 'Guatemala', timezone: 'America/Guatemala', flag: '🇬🇹' },
		],
	},
	{
		offsetMinutes: -300,
		label: 'UTC−5',
		regions: 'US & Canada Eastern, Colombia, Peru, Ecuador',
		cities: [
			{ name: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
			{ name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
			{ name: 'Bogotá', country: 'Colombia', timezone: 'America/Bogota', flag: '🇨🇴' },
			{ name: 'Lima', country: 'Peru', timezone: 'America/Lima', flag: '🇵🇪' },
		],
	},
	{
		offsetMinutes: -240,
		label: 'UTC−4',
		regions: 'Atlantic Canada, Caribbean, Chile (summer), Bolivia',
		cities: [
			{ name: 'Halifax', country: 'Canada', timezone: 'America/Halifax', flag: '🇨🇦' },
			{ name: 'Santiago', country: 'Chile', timezone: 'America/Santiago', flag: '🇨🇱' },
			{ name: 'Caracas', country: 'Venezuela', timezone: 'America/Caracas', flag: '🇻🇪' },
		],
	},
	{
		offsetMinutes: -210,
		label: 'UTC−3:30',
		regions: 'Newfoundland & Labrador',
		cities: [
			{ name: "St. John's", country: 'Canada', timezone: 'America/St_Johns', flag: '🇨🇦' },
		],
	},
	{
		offsetMinutes: -180,
		label: 'UTC−3',
		regions: 'Brazil (east), Argentina, Uruguay, Greenland (west)',
		cities: [
			{ name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
			{ name: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
			{ name: 'Montevideo', country: 'Uruguay', timezone: 'America/Montevideo', flag: '🇺🇾' },
		],
	},
	{
		offsetMinutes: -120,
		label: 'UTC−2',
		regions: 'South Georgia, Fernando de Noronha',
		cities: [
			{ name: 'Noronha', country: 'Brazil', timezone: 'America/Noronha', flag: '🇧🇷' },
		],
	},
	{
		offsetMinutes: -60,
		label: 'UTC−1',
		regions: 'Azores, Cape Verde',
		cities: [
			{ name: 'Azores', country: 'Portugal', timezone: 'Atlantic/Azores', flag: '🇵🇹' },
			{ name: 'Praia', country: 'Cape Verde', timezone: 'Atlantic/Cape_Verde', flag: '🇨🇻' },
		],
	},
	{
		offsetMinutes: 0,
		label: 'UTC+0',
		regions: 'United Kingdom (winter), Ireland (winter), Iceland, Ghana, Morocco (winter)',
		cities: [
			{ name: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
			{ name: 'Dublin', country: 'Ireland', timezone: 'Europe/Dublin', flag: '🇮🇪' },
			{ name: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik', flag: '🇮🇸' },
			{ name: 'Accra', country: 'Ghana', timezone: 'Africa/Accra', flag: '🇬🇭' },
		],
	},
	{
		offsetMinutes: 60,
		label: 'UTC+1',
		regions: 'West Africa, Central Africa, Central Europe (winter)',
		cities: [
			{ name: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos', flag: '🇳🇬' },
			{ name: 'Algiers', country: 'Algeria', timezone: 'Africa/Algiers', flag: '🇩🇿' },
			{ name: 'Kinshasa', country: 'DR Congo', timezone: 'Africa/Kinshasa', flag: '🇨🇩' },
			{ name: 'Tunis', country: 'Tunisia', timezone: 'Africa/Tunis', flag: '🇹🇳' },
		],
	},
	{
		offsetMinutes: 120,
		label: 'UTC+2',
		regions: 'Central & Eastern Europe (summer), Egypt, South Africa, Finland',
		cities: [
			{ name: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
			{ name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
			{ name: 'Rome', country: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
			{ name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
			{ name: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
			{ name: 'Helsinki', country: 'Finland', timezone: 'Europe/Helsinki', flag: '🇫🇮' },
			{ name: 'Athens', country: 'Greece', timezone: 'Europe/Athens', flag: '🇬🇷' },
		],
	},
	{
		offsetMinutes: 180,
		label: 'UTC+3',
		regions: 'Russia (west), Turkey, East Africa, Arabia',
		cities: [
			{ name: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
			{ name: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
			{ name: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', flag: '🇰🇪' },
			{ name: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
		],
	},
	{
		offsetMinutes: 210,
		label: 'UTC+3:30',
		regions: 'Iran',
		cities: [
			{ name: 'Tehran', country: 'Iran', timezone: 'Asia/Tehran', flag: '🇮🇷' },
		],
	},
	{
		offsetMinutes: 240,
		label: 'UTC+4',
		regions: 'Gulf states, Armenia, Georgia, Mauritius',
		cities: [
			{ name: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪' },
			{ name: 'Baku', country: 'Azerbaijan', timezone: 'Asia/Baku', flag: '🇦🇿' },
			{ name: 'Port Louis', country: 'Mauritius', timezone: 'Indian/Mauritius', flag: '🇲🇺' },
		],
	},
	{
		offsetMinutes: 270,
		label: 'UTC+4:30',
		regions: 'Afghanistan',
		cities: [
			{ name: 'Kabul', country: 'Afghanistan', timezone: 'Asia/Kabul', flag: '🇦🇫' },
		],
	},
	{
		offsetMinutes: 300,
		label: 'UTC+5',
		regions: 'Pakistan, Uzbekistan, Maldives',
		cities: [
			{ name: 'Karachi', country: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰' },
			{ name: 'Tashkent', country: 'Uzbekistan', timezone: 'Asia/Tashkent', flag: '🇺🇿' },
		],
	},
	{
		offsetMinutes: 330,
		label: 'UTC+5:30',
		regions: 'India, Sri Lanka',
		cities: [
			{ name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
			{ name: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
			{ name: 'Colombo', country: 'Sri Lanka', timezone: 'Asia/Colombo', flag: '🇱🇰' },
		],
	},
	{
		offsetMinutes: 345,
		label: 'UTC+5:45',
		regions: 'Nepal',
		cities: [
			{ name: 'Kathmandu', country: 'Nepal', timezone: 'Asia/Kathmandu', flag: '🇳🇵' },
		],
	},
	{
		offsetMinutes: 360,
		label: 'UTC+6',
		regions: 'Bangladesh, Kazakhstan (east), Bhutan',
		cities: [
			{ name: 'Dhaka', country: 'Bangladesh', timezone: 'Asia/Dhaka', flag: '🇧🇩' },
			{ name: 'Almaty', country: 'Kazakhstan', timezone: 'Asia/Almaty', flag: '🇰🇿' },
		],
	},
	{
		offsetMinutes: 390,
		label: 'UTC+6:30',
		regions: 'Myanmar, Cocos Islands',
		cities: [
			{ name: 'Yangon', country: 'Myanmar', timezone: 'Asia/Yangon', flag: '🇲🇲' },
		],
	},
	{
		offsetMinutes: 420,
		label: 'UTC+7',
		regions: 'Thailand, Vietnam, Western Indonesia, Cambodia',
		cities: [
			{ name: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
			{ name: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', flag: '🇮🇩' },
			{ name: 'Ho Chi Minh City', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳' },
		],
	},
	{
		offsetMinutes: 480,
		label: 'UTC+8',
		regions: 'China, Singapore, Malaysia, Philippines, Western Australia',
		cities: [
			{ name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
			{ name: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
			{ name: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
			{ name: 'Perth', country: 'Australia', timezone: 'Australia/Perth', flag: '🇦🇺' },
		],
	},
	{
		offsetMinutes: 540,
		label: 'UTC+9',
		regions: 'Japan, South Korea, East Timor',
		cities: [
			{ name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
			{ name: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
		],
	},
	{
		offsetMinutes: 570,
		label: 'UTC+9:30',
		regions: 'South Australia, Northern Territory',
		cities: [
			{ name: 'Adelaide', country: 'Australia', timezone: 'Australia/Adelaide', flag: '🇦🇺' },
			{ name: 'Darwin', country: 'Australia', timezone: 'Australia/Darwin', flag: '🇦🇺' },
		],
	},
	{
		offsetMinutes: 600,
		label: 'UTC+10',
		regions: 'Eastern Australia, Papua New Guinea, Guam',
		cities: [
			{ name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
			{ name: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', flag: '🇦🇺' },
			{ name: 'Brisbane', country: 'Australia', timezone: 'Australia/Brisbane', flag: '🇦🇺' },
		],
	},
	{
		offsetMinutes: 660,
		label: 'UTC+11',
		regions: 'Solomon Islands, Vanuatu, New Caledonia',
		cities: [
			{ name: 'Nouméa', country: 'New Caledonia', timezone: 'Pacific/Noumea', flag: '🇳🇨' },
			{ name: 'Honiara', country: 'Solomon Islands', timezone: 'Pacific/Guadalcanal', flag: '🇸🇧' },
		],
	},
	{
		offsetMinutes: 720,
		label: 'UTC+12',
		regions: 'New Zealand (winter), Fiji, Kamchatka',
		cities: [
			{ name: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
			{ name: 'Fiji', country: 'Fiji', timezone: 'Pacific/Fiji', flag: '🇫🇯' },
		],
	},
	{
		offsetMinutes: 765,
		label: 'UTC+12:45',
		regions: 'Chatham Islands (New Zealand)',
		cities: [
			{ name: 'Chatham Islands', country: 'New Zealand', timezone: 'Pacific/Chatham', flag: '🇳🇿' },
		],
	},
	{
		offsetMinutes: 780,
		label: 'UTC+13',
		regions: 'Samoa, Tonga, Phoenix Islands (summer)',
		cities: [
			{ name: 'Apia', country: 'Samoa', timezone: 'Pacific/Apia', flag: '🇼🇸' },
			{ name: "Nuku'alofa", country: 'Tonga', timezone: 'Pacific/Tongatapu', flag: '🇹🇴' },
		],
	},
	{
		offsetMinutes: 840,
		label: 'UTC+14',
		regions: 'Line Islands (Kiribati)',
		cities: [
			{ name: 'Kiritimati', country: 'Kiribati', timezone: 'Pacific/Kiritimati', flag: '🇰🇮' },
		],
	},
];

export function getTimezoneOffsetMinutes(timeZone: string, date: Date = new Date()): number {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const parts = formatter.formatToParts(date);
	const get = (type: string) =>
		parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
	const asUtc = Date.UTC(
		get('year'),
		get('month') - 1,
		get('day'),
		get('hour'),
		get('minute'),
		get('second'),
	);
	return Math.round((asUtc - date.getTime()) / 60000);
}

export function findBandForOffset(offsetMinutes: number): TimezoneMapBand | undefined {
	return TIMEZONE_MAP_BANDS.find((b) => b.offsetMinutes === offsetMinutes);
}

/** Cities whose live UTC offset matches the given band (handles daylight saving). */
export function getCitiesAtOffset(
	offsetMinutes: number,
	date: Date = new Date(),
): TimezoneMapCity[] {
	const seen = new Set<string>();
	const cities: TimezoneMapCity[] = [];

	for (const band of TIMEZONE_MAP_BANDS) {
		for (const city of band.cities) {
			if (seen.has(city.timezone)) continue;
			if (getTimezoneOffsetMinutes(city.timezone, date) === offsetMinutes) {
				seen.add(city.timezone);
				cities.push(city);
			}
		}
	}

	return cities.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatWallClockAtOffset(date: Date, offsetMinutes: number): string {
	const shifted = new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			date.getUTCSeconds(),
		) +
			offsetMinutes * 60 * 1000,
	);
	const h = String(shifted.getUTCHours()).padStart(2, '0');
	const m = String(shifted.getUTCMinutes()).padStart(2, '0');
	const s = String(shifted.getUTCSeconds()).padStart(2, '0');
	return `${h}:${m}:${s}`;
}

export function formatWallDateAtOffset(date: Date, offsetMinutes: number): string {
	const shifted = new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			date.getUTCSeconds(),
		) +
			offsetMinutes * 60 * 1000,
	);
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(shifted);
}

export function formatCityTime(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).format(date);
}

export function formatCityDate(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone,
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date);
}
