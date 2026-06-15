import { useEffect, useMemo, useState } from 'react';
import {
	findCityForTimezone,
	formatDateString,
	getTimezoneOffsetLabel,
	parseDateString,
	sortedCities,
	wallClockToUtc,
} from '../utils/timezoneHelpers';

function stripAndParseInt(raw) {
	const digits = String(raw).replace(/\D/g, '');
	if (digits === '') return null;
	return parseInt(digits, 10);
}

function clampMinute(value, fallback = 0) {
	const n = stripAndParseInt(value);
	if (n === null || Number.isNaN(n)) return fallback;
	return Math.min(59, Math.max(0, n));
}

function clampHour24(value, fallback = 0) {
	const n = stripAndParseInt(value);
	if (n === null || Number.isNaN(n)) return fallback;
	return Math.min(23, Math.max(0, n));
}

function TimeInput24({ hour, minute, onHourChange, onMinuteChange }) {
	return (
		<div className="ugc-time-row">
			<div className="ugc-time-input-wrap">
				<label className="ugc-field-label">Hour (24h)</label>
				<input
					type="number"
					className="ugc-time-input"
					min={0}
					max={23}
					value={hour}
					onFocus={(e) => e.target.select()}
					onChange={(e) => onHourChange(clampHour24(e.target.value))}
				/>
			</div>
			<span className="ugc-time-sep">:</span>
			<div className="ugc-time-input-wrap">
				<label className="ugc-field-label">Minute</label>
				<input
					type="number"
					className="ugc-time-input"
					min={0}
					max={59}
					value={minute}
					onFocus={(e) => e.target.select()}
					onChange={(e) => onMinuteChange(clampMinute(e.target.value))}
				/>
			</div>
		</div>
	);
}

function CitySelect({ id, value, onChange }) {
	return (
		<div className="ugc-field">
			<label className="ugc-field-label" htmlFor={id}>
				Time zone
			</label>
			<select
				id={id}
				className="ugc-select"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				{sortedCities.map((c) => (
					<option key={`${c.city}-${c.country}`} value={c.city}>
						{c.flag} {c.city}, {c.country}
					</option>
				))}
			</select>
		</div>
	);
}

function getCityByName(cityName) {
	return sortedCities.find((c) => c.city === cityName) ?? sortedCities[0];
}

const utcTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
});

const utcDateFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'UTC',
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

function makeLocalFormatters(timeZone) {
	return {
		time: new Intl.DateTimeFormat('en-GB', {
			timeZone,
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}),
		date: new Intl.DateTimeFormat('en-GB', {
			timeZone,
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		}),
	};
}

export default function UTCGMTConverter() {
	const userTimezone = useMemo(
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
		[],
	);
	const defaultCity = useMemo(
		() => findCityForTimezone(userTimezone),
		[userTimezone],
	);

	const now = new Date();

	const [localCityName, setLocalCityName] = useState(defaultCity.city);
	const [localDate, setLocalDate] = useState(formatDateString(now));
	const [localHour, setLocalHour] = useState(now.getHours());
	const [localMinute, setLocalMinute] = useState(now.getMinutes());

	const utcParts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(now);
	const utcHourNow = parseInt(
		utcParts.find((p) => p.type === 'hour')?.value ?? '0',
		10,
	);
	const utcMinuteNow = parseInt(
		utcParts.find((p) => p.type === 'minute')?.value ?? '0',
		10,
	);
	const utcDateNow = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'UTC',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(now);

	const [targetCityName, setTargetCityName] = useState(defaultCity.city);
	const [utcInputDate, setUtcInputDate] = useState(utcDateNow);
	const [utcHour, setUtcHour] = useState(utcHourNow);
	const [utcMinute, setUtcMinute] = useState(utcMinuteNow);

	useEffect(() => {
		setLocalCityName(defaultCity.city);
		setTargetCityName(defaultCity.city);
	}, [defaultCity.city]);

	const localCity = getCityByName(localCityName);
	const targetCity = getCityByName(targetCityName);

	const localToUtc = useMemo(() => {
		const { year, month, day } = parseDateString(localDate);
		const utcDate = wallClockToUtc(
			year,
			month,
			day,
			localHour,
			localMinute,
			localCity.timezone,
		);
		return {
			time: utcTimeFormatter.format(utcDate),
			date: utcDateFormatter.format(utcDate),
			refDate: utcDate,
		};
	}, [localDate, localHour, localMinute, localCity.timezone]);

	const utcToLocal = useMemo(() => {
		const { year, month, day } = parseDateString(utcInputDate);
		const utcDate = new Date(
			Date.UTC(year, month - 1, day, utcHour, utcMinute, 0),
		);
		const formatters = makeLocalFormatters(targetCity.timezone);
		return {
			time: formatters.time.format(utcDate),
			date: formatters.date.format(utcDate),
			refDate: utcDate,
		};
	}, [utcInputDate, utcHour, utcMinute, targetCity.timezone]);

	const localOffsetLabel = getTimezoneOffsetLabel(
		localCity.city,
		localCity.timezone,
		localToUtc.refDate,
	);
	const targetOffsetLabel = getTimezoneOffsetLabel(
		targetCity.city,
		targetCity.timezone,
		utcToLocal.refDate,
	);

	return (
		<div className="ugc-grid">
			<div className="ugc-card">
				<h2 className="ugc-card-title">Your time to UTC</h2>

				<TimeInput24
					hour={localHour}
					minute={localMinute}
					onHourChange={setLocalHour}
					onMinuteChange={setLocalMinute}
				/>

				<div className="ugc-field">
					<label className="ugc-field-label" htmlFor="local-date">
						Date
					</label>
					<input
						type="date"
						id="local-date"
						className="ugc-input"
						value={localDate}
						onChange={(e) => setLocalDate(e.target.value)}
					/>
				</div>

				<CitySelect
					id="local-city"
					value={localCityName}
					onChange={setLocalCityName}
				/>

				<p className="ugc-offset">{localOffsetLabel}</p>

				<div className="ugc-output">
					<div className="ugc-output-label">UTC / GMT</div>
					<div className="ugc-output-time">{localToUtc.time}</div>
					<div className="ugc-output-date">{localToUtc.date}</div>
				</div>
			</div>

			<div className="ugc-card">
				<h2 className="ugc-card-title">UTC to your time</h2>

				<TimeInput24
					hour={utcHour}
					minute={utcMinute}
					onHourChange={setUtcHour}
					onMinuteChange={setUtcMinute}
				/>

				<div className="ugc-field">
					<label className="ugc-field-label" htmlFor="utc-date">
						Date (UTC)
					</label>
					<input
						type="date"
						id="utc-date"
						className="ugc-input"
						value={utcInputDate}
						onChange={(e) => setUtcInputDate(e.target.value)}
					/>
				</div>

				<CitySelect
					id="target-city"
					value={targetCityName}
					onChange={setTargetCityName}
				/>

				<p className="ugc-offset">{targetOffsetLabel}</p>

				<div className="ugc-output">
					<div className="ugc-output-label">{targetCity.city}</div>
					<div className="ugc-output-time">{utcToLocal.time}</div>
					<div className="ugc-output-date">{utcToLocal.date}</div>
				</div>
			</div>
		</div>
	);
}
