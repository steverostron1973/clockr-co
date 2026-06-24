import { useMemo, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function isWeekend(d) {
	const day = d.getDay();
	return day === 0 || day === 6;
}

function isWorkingDay(d, includeWeekends) {
	return includeWeekends || !isWeekend(d);
}

function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}

function formatDateLong(d) {
	return d.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function getEasterSunday(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return startOfDay(new Date(year, month - 1, day));
}

function addDays(d, n) {
	const out = new Date(d);
	out.setDate(out.getDate() + n);
	return startOfDay(out);
}

function nthWeekdayOfMonth(year, month, weekday, n) {
	const first = new Date(year, month, 1);
	let count = 0;
	const current = new Date(first);
	while (current.getMonth() === month) {
		if (current.getDay() === weekday) {
			count++;
			if (count === n) return startOfDay(current);
		}
		current.setDate(current.getDate() + 1);
	}
	return null;
}

function lastWeekdayOfMonth(year, month, weekday) {
	const last = new Date(year, month + 1, 0);
	const current = new Date(last);
	while (current.getMonth() === month) {
		if (current.getDay() === weekday) return startOfDay(current);
		current.setDate(current.getDate() - 1);
	}
	return null;
}

function ukSubstitute(fixed) {
	const day = fixed.getDay();
	if (day === 6) return addDays(fixed, 2);
	if (day === 0) return addDays(fixed, 1);
	return fixed;
}

function usObserved(fixed) {
	const day = fixed.getDay();
	if (day === 6) return addDays(fixed, -1);
	if (day === 0) return addDays(fixed, 1);
	return fixed;
}

function getUKBankHolidays(year) {
	const easter = getEasterSunday(year);
	const holidays = [
		ukSubstitute(startOfDay(new Date(year, 0, 1))),
		addDays(easter, -2),
		addDays(easter, 1),
		nthWeekdayOfMonth(year, 4, 1, 1),
		lastWeekdayOfMonth(year, 4, 1),
		lastWeekdayOfMonth(year, 7, 1),
		ukSubstitute(startOfDay(new Date(year, 11, 25))),
		ukSubstitute(startOfDay(new Date(year, 11, 26))),
	].filter(Boolean);

	const unique = new Map();
	for (const h of holidays) {
		unique.set(h.getTime(), h);
	}
	return [...unique.values()];
}

function getUSFederalHolidays(year) {
	const holidays = [
		usObserved(startOfDay(new Date(year, 0, 1))),
		nthWeekdayOfMonth(year, 0, 1, 3),
		nthWeekdayOfMonth(year, 1, 1, 3),
		lastWeekdayOfMonth(year, 4, 1),
		usObserved(startOfDay(new Date(year, 5, 19))),
		usObserved(startOfDay(new Date(year, 6, 4))),
		nthWeekdayOfMonth(year, 8, 1, 1),
		nthWeekdayOfMonth(year, 9, 1, 2),
		usObserved(startOfDay(new Date(year, 10, 11))),
		nthWeekdayOfMonth(year, 10, 4, 4),
		usObserved(startOfDay(new Date(year, 11, 25))),
	].filter(Boolean);

	const unique = new Map();
	for (const h of holidays) {
		unique.set(h.getTime(), h);
	}
	return [...unique.values()];
}

function getHolidaysInRange(country, start, end) {
	if (!start || !end || start > end) return [];

	const holidays = [];
	for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
		const yearHolidays = country === 'us' ? getUSFederalHolidays(y) : getUKBankHolidays(y);
		holidays.push(...yearHolidays);
	}

	return holidays.filter((h) => h >= start && h <= end);
}

function isHoliday(d, holidays) {
	return holidays.some((h) => h.getTime() === d.getTime());
}

function countDaysInRange(from, to, includeWeekends, excludeHolidays, holidays) {
	let s = startOfDay(from);
	let e = startOfDay(to);
	if (s > e) [s, e] = [e, s];

	let calendar = 0;
	let working = 0;
	const current = new Date(s);

	while (current <= e) {
		calendar++;
		const works = isWorkingDay(current, includeWeekends);
		const onHoliday = excludeHolidays && isHoliday(current, holidays);
		if (works && !onHoliday) working++;
		current.setDate(current.getDate() + 1);
	}

	return { calendar, working };
}

function countUntil(from, to, includeWeekends, excludeHolidays, holidays) {
	if (!from || !to || to < from) return null;

	const { calendar, working } = countDaysInRange(
		from,
		to,
		includeWeekends,
		excludeHolidays,
		holidays,
	);

	const weeks = Math.floor(calendar / 7);
	const days = calendar % 7;
	const workingWeeks = Math.floor(working / 5);
	const workingDaysRemainder = includeWeekends
		? working % 7
		: working % 5;

	return {
		calendar,
		working,
		weeks,
		days,
		workingWeeks: includeWeekends ? Math.floor(working / 7) : workingWeeks,
		workingDaysRemainder,
	};
}

function addWorkingDays(start, days, includeWeekends, excludeHolidays, holidays) {
	if (!start || days < 1) return null;

	let current = startOfDay(start);
	let remaining = days;
	let calendarDays = 0;

	while (remaining > 0) {
		current = addDays(current, 1);
		calendarDays++;
		const works = isWorkingDay(current, includeWeekends);
		const onHoliday = excludeHolidays && isHoliday(current, holidays);
		if (works && !onHoliday) remaining--;
	}

	return { finishDate: current, calendarDays };
}

function sanitizeInteger(raw) {
	return String(raw).replace(/\D/g, '');
}

function parseInteger(raw, fallback = null) {
	if (raw === '' || raw == null) return fallback;
	const n = parseInt(raw, 10);
	return Number.isNaN(n) ? fallback : n;
}

function weeksDaysLabel(weeks, days) {
	if (weeks === 0) return `${days} day${days === 1 ? '' : 's'}`;
	if (days === 0) return `${weeks} week${weeks === 1 ? '' : 's'}`;
	return `${weeks} week${weeks === 1 ? '' : 's'} and ${days} day${days === 1 ? '' : 's'}`;
}

export default function ProjectDeadlineCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [mode, setMode] = useState('countdown');
	const [startDate, setStartDate] = useState(null);
	const [startDisplay, setStartDisplay] = useState('');
	const [deadlineDate, setDeadlineDate] = useState(null);
	const [deadlineDisplay, setDeadlineDisplay] = useState('');
	const [finishStartDate, setFinishStartDate] = useState(today);
	const [finishStartDisplay, setFinishStartDisplay] = useState(dateToDisplay(today));
	const [workingDaysRaw, setWorkingDaysRaw] = useState('30');
	const [includeWeekends, setIncludeWeekends] = useState(false);
	const [excludeHolidays, setExcludeHolidays] = useState(false);
	const [holidayCountry, setHolidayCountry] = useState('uk');

	const workingDaysToAdd = parseInteger(workingDaysRaw, 0) ?? 0;

	const holidayRangeStart = useMemo(() => {
		if (mode === 'countdown') return startDate ?? today;
		return finishStartDate ?? today;
	}, [mode, startDate, finishStartDate, today]);

	const holidayRangeEnd = useMemo(() => {
		if (mode === 'countdown') return deadlineDate;
		if (!finishStartDate || workingDaysToAdd < 1) return null;
		const estimate = addDays(finishStartDate, workingDaysToAdd * 2 + 30);
		return estimate;
	}, [mode, deadlineDate, finishStartDate, workingDaysToAdd]);

	const holidays = useMemo(() => {
		if (!excludeHolidays || !holidayRangeStart || !holidayRangeEnd) return [];
		return getHolidaysInRange(holidayCountry, holidayRangeStart, holidayRangeEnd);
	}, [excludeHolidays, holidayCountry, holidayRangeStart, holidayRangeEnd]);

	const countdownResult = useMemo(() => {
		if (!deadlineDate) return null;
		if (startDate && deadlineDate < startDate) return { invalid: true };
		if (deadlineDate < today) return { invalid: true };

		const rangeHolidays =
			excludeHolidays && holidays.length
				? holidays
				: excludeHolidays
					? getHolidaysInRange(holidayCountry, today, deadlineDate)
					: [];

		const until = countUntil(
			today,
			deadlineDate,
			includeWeekends,
			excludeHolidays,
			rangeHolidays,
		);
		if (!until) return null;

		const showProgress = Boolean(startDate && startDate <= today && deadlineDate > startDate);
		const totalSpan = showProgress ? diffDays(startDate, deadlineDate) : 0;
		const elapsed = showProgress ? diffDays(startDate, today) : 0;
		const progressPct = showProgress
			? clamp((elapsed / totalSpan) * 100, 0, 100)
			: null;

		const holidaysInRange = excludeHolidays
			? rangeHolidays.filter(
					(h) => h >= today && h <= deadlineDate && isWorkingDay(h, includeWeekends),
				).length
			: 0;

		return {
			...until,
			holidaysExcluded: holidaysInRange,
			showProgress,
			progressPct,
			elapsed,
			remaining: showProgress ? totalSpan - elapsed : until.calendar,
		};
	}, [
		startDate,
		deadlineDate,
		today,
		includeWeekends,
		excludeHolidays,
		holidays,
		holidayCountry,
	]);

	const finishResult = useMemo(() => {
		if (!finishStartDate || workingDaysToAdd < 1) return null;

		const rangeHolidays = excludeHolidays
			? getHolidaysInRange(
					holidayCountry,
					finishStartDate,
					addDays(finishStartDate, workingDaysToAdd * 2 + 60),
				)
			: [];

		const added = addWorkingDays(
			finishStartDate,
			workingDaysToAdd,
			includeWeekends,
			excludeHolidays,
			rangeHolidays,
		);
		if (!added) return null;

		return {
			finishDate: added.finishDate,
			finishDateFormatted: formatDateLong(added.finishDate),
			calendarDays: added.calendarDays,
		};
	}, [
		finishStartDate,
		workingDaysToAdd,
		includeWeekends,
		excludeHolidays,
		holidayCountry,
	]);

	function handleStartChange(parsed, masked) {
		setStartDisplay(masked);
		setStartDate(parsed ? startOfDay(parsed) : null);
	}

	function handleDeadlineChange(parsed, masked) {
		setDeadlineDisplay(masked);
		setDeadlineDate(parsed ? startOfDay(parsed) : null);
	}

	function handleFinishStartChange(parsed, masked) {
		setFinishStartDisplay(masked);
		setFinishStartDate(parsed ? startOfDay(parsed) : null);
	}

	function handleWorkingDaysChange(e) {
		setWorkingDaysRaw(sanitizeInteger(e.target.value));
	}

	function handleWorkingDaysBlur() {
		if (workingDaysRaw === '') return;
		const n = parseInteger(workingDaysRaw, 1) ?? 1;
		setWorkingDaysRaw(String(clamp(n, 1, 9999)));
	}

	return (
		<div className="pdc-tool">
			<div className="pdc-tabs" role="tablist" aria-label="Calculator mode">
				<button
					type="button"
					className={`pdc-tab${mode === 'countdown' ? ' pdc-tab--active' : ''}`}
					role="tab"
					aria-selected={mode === 'countdown'}
					onClick={() => setMode('countdown')}
				>
					Time until deadline
				</button>
				<button
					type="button"
					className={`pdc-tab${mode === 'finish' ? ' pdc-tab--active' : ''}`}
					role="tab"
					aria-selected={mode === 'finish'}
					onClick={() => setMode('finish')}
				>
					Calculate finish date
				</button>
			</div>

			<div className="pdc-form-card">
				{mode === 'countdown' ? (
					<div className="rcc-inputs">
						<DateInput
							id="pdc-start-date"
							label="Start date"
							value={startDisplay}
							onChange={handleStartChange}
						/>
						<DateInput
							id="pdc-deadline-date"
							label="Deadline date"
							value={deadlineDisplay}
							onChange={handleDeadlineChange}
						/>
					</div>
				) : (
					<div className="rcc-inputs">
						<DateInput
							id="pdc-finish-start-date"
							label="Start date"
							value={finishStartDisplay}
							onChange={handleFinishStartChange}
						/>
						<div className="rcc-input-wrap">
							<label className="rcc-label" htmlFor="pdc-working-days">
								Number of working days to add
							</label>
							<input
								id="pdc-working-days"
								type="text"
								inputMode="numeric"
								className="rcc-input"
								value={workingDaysRaw}
								onChange={handleWorkingDaysChange}
								onFocus={(e) => e.target.select()}
								onBlur={handleWorkingDaysBlur}
								autoComplete="off"
							/>
						</div>
					</div>
				)}

				<div className="pdc-options">
					<div className="pdc-toggle-group" role="group" aria-label="Weekend handling">
						<button
							type="button"
							className={`pdc-toggle-btn${!includeWeekends ? ' pdc-toggle-btn--active' : ''}`}
							onClick={() => setIncludeWeekends(false)}
							aria-pressed={!includeWeekends}
						>
							Exclude weekends
						</button>
						<button
							type="button"
							className={`pdc-toggle-btn${includeWeekends ? ' pdc-toggle-btn--active' : ''}`}
							onClick={() => setIncludeWeekends(true)}
							aria-pressed={includeWeekends}
						>
							Include weekends
						</button>
					</div>

					<div className="pdc-holiday-row">
						<label className="pdc-checkbox">
							<input
								type="checkbox"
								checked={excludeHolidays}
								onChange={(e) => setExcludeHolidays(e.target.checked)}
							/>
							<span className="pdc-checkbox-box" aria-hidden="true" />
							<span className="pdc-checkbox-label">Exclude public holidays</span>
						</label>

						{excludeHolidays && (
							<select
								className="pdc-select"
								value={holidayCountry}
								onChange={(e) => setHolidayCountry(e.target.value)}
								aria-label="Public holiday region"
							>
								<option value="uk">United Kingdom</option>
								<option value="us">United States</option>
							</select>
						)}
					</div>
				</div>
			</div>

			{mode === 'countdown' && countdownResult && !countdownResult.invalid && (
				<div className="pdc-results" aria-live="polite">
					<div className="pdc-stats-grid">
						<div className="pdc-stat-card">
							<div className="pdc-stat-label">Calendar days until deadline</div>
							<div className="pdc-stat-num">{countdownResult.calendar}</div>
							<div className="pdc-stat-sub">
								{weeksDaysLabel(countdownResult.weeks, countdownResult.days)}
							</div>
						</div>
						<div className="pdc-stat-card">
							<div className="pdc-stat-label">Working days until deadline</div>
							<div className="pdc-stat-num">{countdownResult.working}</div>
							<div className="pdc-stat-sub">
								{includeWeekends
									? weeksDaysLabel(
											countdownResult.workingWeeks,
											countdownResult.workingDaysRemainder,
										)
									: `${countdownResult.working} weekday${countdownResult.working === 1 ? '' : 's'}`}
							</div>
						</div>
					</div>

					{excludeHolidays && countdownResult.holidaysExcluded > 0 && (
						<p className="pdc-holiday-note">
							{countdownResult.holidaysExcluded} public holiday
							{countdownResult.holidaysExcluded === 1 ? '' : 's'} excluded from the
							working day count
						</p>
					)}

					{countdownResult.showProgress && (
						<div className="pdc-progress">
							<div className="pdc-progress-top">
								<span>Start date</span>
								<span>Deadline</span>
							</div>
							<div
								className="pdc-progress-track"
								role="progressbar"
								aria-valuenow={Math.round(countdownResult.progressPct)}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label="Project time elapsed"
							>
								<div
									className="pdc-progress-fill"
									style={{ width: `${countdownResult.progressPct}%` }}
								/>
							</div>
							<div className="pdc-progress-labels">
								<span>{countdownResult.elapsed} days elapsed</span>
								<span>{countdownResult.remaining} days remaining</span>
							</div>
						</div>
					)}
				</div>
			)}

			{mode === 'countdown' && countdownResult?.invalid && (
				<p className="pdc-error" role="alert">
					The deadline must be today or in the future, and on or after the start
					date if one is set.
				</p>
			)}

			{mode === 'finish' && finishResult && (
				<div className="pdc-results" aria-live="polite">
					<div className="pdc-finish-card">
						<div className="pdc-finish-label">Finish date</div>
						<div className="pdc-finish-date">{finishResult.finishDateFormatted}</div>
						<p className="pdc-finish-sub">
							{workingDaysToAdd} working day{workingDaysToAdd === 1 ? '' : 's'} from{' '}
							{formatDateLong(finishStartDate)} ({finishResult.calendarDays} calendar
							day{finishResult.calendarDays === 1 ? '' : 's'})
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
