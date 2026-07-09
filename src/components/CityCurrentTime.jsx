import { useEffect, useMemo, useState } from 'react';
import {
	calculateSunTimes,
	formatMinutesLocal,
} from '../utils/solarPosition';

function formatOffset(timeZone, date) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		timeZoneName: 'shortOffset',
	}).formatToParts(date);
	const raw = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
	return raw.replace('GMT', 'UTC');
}

function getLocalDateKey(date, timeZone) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

export default function CityCurrentTime({ cityName, timezone, lat, lng }) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const timeFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat('en-GB', {
				timeZone: timezone,
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			}),
		[timezone],
	);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat('en-GB', {
				timeZone: timezone,
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}),
		[timezone],
	);

	const localDateKey = useMemo(
		() => getLocalDateKey(now, timezone),
		[now, timezone],
	);

	const sunTimes = useMemo(
		() => calculateSunTimes(now, lat, lng, timezone),
		[now, lat, lng, timezone, localDateKey],
	);

	let sunSummary = null;
	if (sunTimes.midnightSun) {
		sunSummary = 'Midnight sun today — the sun does not set.';
	} else if (sunTimes.polarNight) {
		sunSummary = 'Polar night today — the sun does not rise.';
	} else if (
		sunTimes.sunrise.minutes !== null &&
		sunTimes.sunset.minutes !== null
	) {
		sunSummary = `Sunrise ${formatMinutesLocal(sunTimes.sunrise.minutes)} · Sunset ${formatMinutesLocal(sunTimes.sunset.minutes)}`;
	}

	return (
		<div className="ct-tool">
			<div className="ct-live-card">
				<div className="ct-live-label">{cityName}</div>
				<div className="ct-live-time">{timeFormatter.format(now)}</div>
				<div className="ct-live-date">{dateFormatter.format(now)}</div>
				<div className="ct-live-offset">{formatOffset(timezone, now)}</div>
			</div>
			{sunSummary ? (
				<div className="ct-sun-card">
					<div className="ct-sun-title">Sun today</div>
					<p className="ct-sun-text">{sunSummary}</p>
				</div>
			) : null}
		</div>
	);
}
