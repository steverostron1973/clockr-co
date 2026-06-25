/**
 * Solar position calculations (based on SunCalc / NOAA algorithms).
 * Returns local times for a given IANA timezone.
 */

const PI = Math.PI;
const RAD = PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;
const E = RAD * 23.4397;

const SUNRISE_ANGLE = -0.833; // degrees, centre of sun with refraction
const CIVIL_TWILIGHT_ANGLE = -6;

function toJulian(date: Date): number {
	return date.valueOf() / DAY_MS - 0.5 + J1970;
}

function fromJulian(j: number): Date {
	return new Date((j + 0.5 - J1970) * DAY_MS);
}

function toDays(date: Date): number {
	return toJulian(date) - J2000;
}

function solarMeanAnomaly(d: number): number {
	return RAD * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M: number): number {
	const C =
		RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
	const P = RAD * 102.9372;
	return M + C + P + PI;
}

function declination(L: number, b: number): number {
	return Math.asin(
		Math.sin(b) * Math.cos(E) + Math.cos(b) * Math.sin(E) * Math.sin(L),
	);
}

function julianCycle(d: number, lw: number): number {
	return Math.round(d - J0 - lw / (2 * PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
	return J0 + (Ht + lw) / (2 * PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
	return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number): number {
	return Math.acos(
		(Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)),
	);
}

function getSetJ(
	h: number,
	lw: number,
	phi: number,
	dec: number,
	n: number,
	M: number,
	L: number,
): number {
	const w = hourAngle(h, phi, dec);
	const a = approxTransit(w, lw, n);
	return solarTransitJ(a, M, L);
}

function utcDateToLocalMinutes(utcDate: Date, timezone: string): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		hourCycle: 'h23',
		hour: 'numeric',
		minute: 'numeric',
	}).formatToParts(utcDate);
	const get = (type: string) =>
		parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
	return get('hour') * 60 + get('minute');
}

export interface SunEventMinutes {
	minutes: number | null;
}

export interface SunTimes {
	sunrise: SunEventMinutes;
	sunset: SunEventMinutes;
	solarNoon: SunEventMinutes;
	dawn: SunEventMinutes;
	dusk: SunEventMinutes;
	daylightMinutes: number | null;
	polarNight: boolean;
	midnightSun: boolean;
}

function safeLocalMinutes(utcDate: Date | null, timezone: string): number | null {
	if (!utcDate || !Number.isFinite(utcDate.getTime())) return null;
	return utcDateToLocalMinutes(utcDate, timezone);
}

function calcEventPair(
	angleDeg: number,
	lw: number,
	phi: number,
	dec: number,
	n: number,
	M: number,
	L: number,
	Jnoon: number,
): { rise: number; set: number } {
	const h = angleDeg * RAD;
	try {
		const Jset = getSetJ(h, lw, phi, dec, n, M, L);
		const Jrise = Jnoon - (Jset - Jnoon);
		return { rise: Jrise, set: Jset };
	} catch {
		return { rise: NaN, set: NaN };
	}
}

export function calculateSunTimes(
	date: Date,
	latitude: number,
	longitude: number,
	timezone: string,
): SunTimes {
	const lw = RAD * -longitude;
	const phi = RAD * latitude;
	const d = toDays(
		new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
	);
	const n = julianCycle(d, lw);
	const ds = approxTransit(0, lw, n);
	const M = solarMeanAnomaly(ds);
	const L = eclipticLongitude(M);
	const dec = declination(L, 0);
	const Jnoon = solarTransitJ(ds, M, L);

	const sun = calcEventPair(
		SUNRISE_ANGLE,
		lw,
		phi,
		dec,
		n,
		M,
		L,
		Jnoon,
	);
	const civil = calcEventPair(
		CIVIL_TWILIGHT_ANGLE,
		lw,
		phi,
		dec,
		n,
		M,
		L,
		Jnoon,
	);

	if (!Number.isFinite(sun.rise) || !Number.isFinite(sun.set)) {
		const decDeg = dec / RAD;
		const midnightSun =
			latitude > 0 ? decDeg > 90 - latitude : decDeg < -90 - latitude;
		return {
			sunrise: { minutes: null },
			sunset: { minutes: null },
			solarNoon: { minutes: safeLocalMinutes(fromJulian(Jnoon), timezone) },
			dawn: { minutes: null },
			dusk: { minutes: null },
			daylightMinutes: midnightSun ? 24 * 60 : 0,
			polarNight: !midnightSun,
			midnightSun,
		};
	}

	const sunriseUtc = fromJulian(sun.rise);
	const sunsetUtc = fromJulian(sun.set);
	const solarNoonUtc = fromJulian(Jnoon);
	const dawnUtc = fromJulian(civil.rise);
	const duskUtc = fromJulian(civil.set);

	const sunrise = { minutes: safeLocalMinutes(sunriseUtc, timezone) };
	const sunset = { minutes: safeLocalMinutes(sunsetUtc, timezone) };
	const solarNoon = { minutes: safeLocalMinutes(solarNoonUtc, timezone) };
	const dawn = { minutes: safeLocalMinutes(dawnUtc, timezone) };
	const dusk = { minutes: safeLocalMinutes(duskUtc, timezone) };

	let daylightMinutes: number | null = null;
	if (sunrise.minutes !== null && sunset.minutes !== null) {
		daylightMinutes = sunset.minutes - sunrise.minutes;
		if (daylightMinutes < 0) daylightMinutes += 24 * 60;
	}

	return {
		sunrise,
		sunset,
		solarNoon,
		dawn,
		dusk,
		daylightMinutes,
		polarNight: false,
		midnightSun: false,
	};
}

export function formatMinutesLocal(minutes: number | null): string {
	if (minutes === null) return '—';
	const h = Math.floor(minutes / 60) % 24;
	const m = Math.round(minutes % 60);
	const period = h >= 12 ? 'pm' : 'am';
	const hour12 = h % 12 === 0 ? 12 : h % 12;
	return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDaylightDuration(minutes: number | null): string {
	if (minutes === null) return '—';
	const hours = Math.floor(minutes / 60);
	const mins = Math.round(minutes % 60);
	const hourLabel = hours === 1 ? 'hour' : 'hours';
	const minLabel = mins === 1 ? 'minute' : 'minutes';
	if (hours === 0) return `${mins} ${minLabel}`;
	if (mins === 0) return `${hours} ${hourLabel}`;
	return `${hours} ${hourLabel}, ${mins} ${minLabel}`;
}

export function getCurrentLocalMinutes(timezone: string, now = new Date()): number {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		hourCycle: 'h23',
		hour: 'numeric',
		minute: 'numeric',
	}).formatToParts(now);
	const get = (type: string) =>
		parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
	return get('hour') * 60 + get('minute');
}

export function isSameLocalDay(
	date: Date,
	timezone: string,
	now = new Date(),
): boolean {
	const fmt = (d: Date) =>
		new Intl.DateTimeFormat('en-CA', {
			timeZone: timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(d);
	return fmt(date) === fmt(now);
}
