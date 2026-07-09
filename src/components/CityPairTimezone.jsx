import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	findWorkingHoursOverlap,
	formatDateString,
	formatTimeDifferenceSentence,
	getLocalParts,
	getOffsetMinutes,
	parseDateString,
	wallClockToUtc,
} from '../utils/timezoneHelpers';

function formatOffset(timeZone, date) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		timeZoneName: 'shortOffset',
	}).formatToParts(date);
	const raw = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
	return raw.replace('GMT', 'UTC');
}

function formatDuration(totalMinutes) {
	const hours = Math.floor(Math.abs(totalMinutes) / 60);
	const mins = Math.abs(totalMinutes) % 60;
	const parts = [];
	if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
	if (mins > 0) parts.push(`${mins} minute${mins === 1 ? '' : 's'}`);
	return parts.join(' ') || '0 hours';
}

export default function CityPairTimezone({
	fromCity,
	toCity,
	fromTimezone,
	toTimezone,
}) {
	const [now, setNow] = useState(() => new Date());
	const [dateValue, setDateValue] = useState(() => formatDateString(new Date()));
	const [timeValue, setTimeValue] = useState(() => {
		const current = new Date();
		return `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
	});

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const timeFormatter = useMemo(
		() =>
			new Map([
				[
					fromTimezone,
					new Intl.DateTimeFormat('en-GB', {
						timeZone: fromTimezone,
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false,
					}),
				],
				[
					toTimezone,
					new Intl.DateTimeFormat('en-GB', {
						timeZone: toTimezone,
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit',
						hour12: false,
					}),
				],
			]),
		[fromTimezone, toTimezone],
	);

	const dateFormatter = useMemo(
		() =>
			new Map([
				[
					fromTimezone,
					new Intl.DateTimeFormat('en-GB', {
						timeZone: fromTimezone,
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}),
				],
				[
					toTimezone,
					new Intl.DateTimeFormat('en-GB', {
						timeZone: toTimezone,
						weekday: 'long',
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}),
				],
			]),
		[fromTimezone, toTimezone],
	);

	const resultFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat('en-GB', {
				timeZone: toTimezone,
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
		[toTimezone],
	);

	const resultDateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat('en-GB', {
				timeZone: toTimezone,
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			}),
		[toTimezone],
	);

	const timeDifference = useMemo(
		() =>
			formatTimeDifferenceSentence(
				fromCity,
				toCity,
				fromTimezone,
				toTimezone,
				now,
			),
		[fromCity, toCity, fromTimezone, toTimezone, now],
	);

	const meetingOverlap = useMemo(
		() =>
			findWorkingHoursOverlap(
				fromCity,
				toCity,
				fromTimezone,
				toTimezone,
				now,
			),
		[fromCity, toCity, fromTimezone, toTimezone, now],
	);

	const converted = useMemo(() => {
		if (!dateValue || !timeValue) return null;
		const { year, month, day } = parseDateString(dateValue);
		const [hour, minute] = timeValue.split(':').map(Number);
		return wallClockToUtc(year, month, day, hour, minute, fromTimezone);
	}, [dateValue, timeValue, fromTimezone]);

	const dayRelationship = useMemo(() => {
		if (!converted) return '—';
		const fromKey = new Intl.DateTimeFormat('en-CA', {
			timeZone: fromTimezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(converted);
		const toKey = new Intl.DateTimeFormat('en-CA', {
			timeZone: toTimezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(converted);
		if (toKey > fromKey) return `Next day in ${toCity}`;
		if (toKey < fromKey) return `Previous day in ${toCity}`;
		return 'Same day in both cities';
	}, [converted, fromTimezone, toTimezone, toCity]);

	const converterDiff = useMemo(() => {
		if (!converted) return '—';
		const diffMinutes =
			getOffsetMinutes(toTimezone, converted) -
			getOffsetMinutes(fromTimezone, converted);
		if (diffMinutes === 0) {
			return `${toCity} is the same time as ${fromCity}`;
		}
		if (diffMinutes < 0) {
			return `${toCity} is ${formatDuration(diffMinutes)} behind ${fromCity}`;
		}
		return `${toCity} is ${formatDuration(diffMinutes)} ahead of ${fromCity}`;
	}, [converted, fromCity, fromTimezone, toCity, toTimezone]);

	const setNowAsInput = useCallback(() => {
		const local = getLocalParts(new Date(), fromTimezone);
		setDateValue(
			`${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`,
		);
		setTimeValue(
			`${String(local.hour).padStart(2, '0')}:${String(local.minute).padStart(2, '0')}`,
		);
	}, [fromTimezone]);

	useEffect(() => {
		setNowAsInput();
	}, [setNowAsInput]);

	return (
		<div className="tp-tool">
			<div className="tp-live-grid">
				<div className="tp-live-card">
					<div className="tp-live-label">{fromCity}</div>
					<div className="tp-live-time">
						{timeFormatter.get(fromTimezone)?.format(now) ?? '--:--:--'}
					</div>
					<div className="tp-live-date">
						{dateFormatter.get(fromTimezone)?.format(now) ?? '—'}
					</div>
					<div className="tp-live-offset">{formatOffset(fromTimezone, now)}</div>
				</div>
				<div className="tp-live-card">
					<div className="tp-live-label">{toCity}</div>
					<div className="tp-live-time">
						{timeFormatter.get(toTimezone)?.format(now) ?? '--:--:--'}
					</div>
					<div className="tp-live-date">
						{dateFormatter.get(toTimezone)?.format(now) ?? '—'}
					</div>
					<div className="tp-live-offset">{formatOffset(toTimezone, now)}</div>
				</div>
			</div>

			<div className="tp-diff-banner">{timeDifference}</div>

			<div className="tp-form-card">
				<h2 className="tp-section-title">Convert a time</h2>
				<p className="tp-section-lead">
					Pick a date and time in {fromCity} to see the equivalent in {toCity}.
				</p>
				<div className="tp-inputs">
					<div className="tp-input-wrap">
						<label className="tp-label" htmlFor="tp-date">
							Date in {fromCity}
						</label>
						<input
							id="tp-date"
							type="date"
							className="tp-input"
							value={dateValue}
							onChange={(event) => setDateValue(event.target.value)}
						/>
					</div>
					<div className="tp-input-wrap">
						<label className="tp-label" htmlFor="tp-time">
							Time in {fromCity}
						</label>
						<input
							id="tp-time"
							type="time"
							className="tp-input"
							value={timeValue}
							onChange={(event) => setTimeValue(event.target.value)}
						/>
					</div>
				</div>
				<button type="button" className="tp-now-btn" onClick={setNowAsInput}>
					Use current time in {fromCity}
				</button>
			</div>

			<div className="tp-result-card">
				<div className="tp-result-label">In {toCity}</div>
				<div className="tp-result-time">
					{converted ? resultFormatter.format(converted) : '--:--'}
				</div>
				<div className="tp-result-date">
					{converted ? resultDateFormatter.format(converted) : '—'}
				</div>
			</div>

			<div className="tp-meta">
				<div className="tp-meta-row">
					<span className="tp-meta-label">{fromCity}</span>
					<span className="tp-meta-value">
						{converted
							? formatOffset(fromTimezone, converted)
							: formatOffset(fromTimezone, now)}
					</span>
				</div>
				<div className="tp-meta-row">
					<span className="tp-meta-label">{toCity}</span>
					<span className="tp-meta-value">
						{converted
							? formatOffset(toTimezone, converted)
							: formatOffset(toTimezone, now)}
					</span>
				</div>
				<div className="tp-meta-row tp-meta-highlight">
					<span className="tp-meta-label">Time difference</span>
					<span className="tp-meta-value">{converterDiff}</span>
				</div>
				<div className="tp-meta-row">
					<span className="tp-meta-label">Day relationship</span>
					<span className="tp-meta-value">{dayRelationship}</span>
				</div>
			</div>

			<div className="tp-meeting-card">
				<h2 className="tp-section-title">Best time to meet</h2>
				<p className="tp-section-lead">
					Rough overlap of 9:00 AM–6:00 PM working hours in both cities (today).
				</p>
				{meetingOverlap ? (
					<div className="tp-meeting-overlap">
						<p>
							<strong>{meetingOverlap.fromLabel}</strong>
						</p>
						<p>
							<strong>{meetingOverlap.toLabel}</strong>
						</p>
					</div>
				) : (
					<p className="tp-meeting-none">
						No shared working hours today — try the{' '}
						<a href="/time-zone-meeting-planner">Time Zone Meeting Planner</a> to
						explore other dates.
					</p>
				)}
			</div>
		</div>
	);
}
