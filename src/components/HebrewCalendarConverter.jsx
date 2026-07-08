import { useCallback, useMemo, useRef, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';
import {
	formatGregorianLong,
	formatHebrewLong,
	getHebrewMonthLength,
	getHebrewMonthsForYear,
	gregorianDateToHebrew,
	hebrewPartsToGregorian,
	HEBREW_YEAR_MAX,
	HEBREW_YEAR_MIN,
	isValidHebrewParts,
	normalizeHebrewMonthForYear,
	startOfLocalDay,
} from '../data/hebrewConversion';

function clampDay(day, maxDay) {
	const n = parseInt(String(day), 10);
	if (Number.isNaN(n)) return 1;
	return Math.min(maxDay, Math.max(1, n));
}

function clampYear(year) {
	const n = parseInt(String(year), 10);
	if (Number.isNaN(n)) return 5786;
	return Math.min(HEBREW_YEAR_MAX, Math.max(HEBREW_YEAR_MIN, n));
}

export default function HebrewCalendarConverter() {
	const today = useMemo(() => startOfLocalDay(new Date()), []);
	const todayHebrew = useMemo(() => gregorianDateToHebrew(today), [today]);

	const syncSource = useRef(null);

	const [gregorianDate, setGregorianDate] = useState(today);
	const [gregorianDisplay, setGregorianDisplay] = useState(() =>
		dateToDisplay(today),
	);

	const [hebrewDay, setHebrewDay] = useState(todayHebrew.day);
	const [hebrewMonth, setHebrewMonth] = useState(todayHebrew.month);
	const [hebrewYear, setHebrewYear] = useState(todayHebrew.year);

	const [gregorianError, setGregorianError] = useState('');
	const [hebrewError, setHebrewError] = useState('');

	const monthOptions = useMemo(
		() => getHebrewMonthsForYear(hebrewYear),
		[hebrewYear],
	);

	const monthLength = useMemo(
		() => getHebrewMonthLength(hebrewYear, hebrewMonth),
		[hebrewYear, hebrewMonth],
	);

	const hebrewParts = useMemo(
		() => ({ year: hebrewYear, month: hebrewMonth, day: hebrewDay }),
		[hebrewYear, hebrewMonth, hebrewDay],
	);

	const syncFromGregorian = useCallback((date) => {
		try {
			const hebrew = gregorianDateToHebrew(date);
			syncSource.current = 'gregorian';
			setHebrewDay(hebrew.day);
			setHebrewMonth(hebrew.month);
			setHebrewYear(hebrew.year);
			setGregorianError('');
			setHebrewError('');
			syncSource.current = null;
		} catch {
			setGregorianError(
				`Date is outside the supported conversion range (${HEBREW_YEAR_MIN}–${HEBREW_YEAR_MAX} AM).`,
			);
		}
	}, []);

	const syncFromHebrew = useCallback((parts) => {
		if (!isValidHebrewParts(parts)) {
			setHebrewError('Enter a valid Hebrew date within the supported range.');
			return;
		}

		try {
			const greg = hebrewPartsToGregorian(parts);
			syncSource.current = 'hebrew';
			setGregorianDate(greg);
			setGregorianDisplay(dateToDisplay(greg));
			setGregorianError('');
			setHebrewError('');
			syncSource.current = null;
		} catch {
			setHebrewError(
				`Date is outside the supported conversion range (${HEBREW_YEAR_MIN}–${HEBREW_YEAR_MAX} AM).`,
			);
		}
	}, []);

	function handleGregorianChange(parsed, masked) {
		setGregorianDisplay(masked);
		if (!parsed) {
			setGregorianDate(null);
			return;
		}

		const date = startOfLocalDay(parsed);
		setGregorianDate(date);
		if (syncSource.current !== 'hebrew') {
			syncFromGregorian(date);
		}
	}

	function handleHebrewDayChange(value) {
		const day = clampDay(value, monthLength);
		setHebrewDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHebrew({ year: hebrewYear, month: hebrewMonth, day });
		}
	}

	function handleHebrewMonthChange(value) {
		const month = parseInt(value, 10);
		const maxDay = getHebrewMonthLength(hebrewYear, month);
		const day = Math.min(hebrewDay, maxDay);
		setHebrewMonth(month);
		setHebrewDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHebrew({ year: hebrewYear, month, day });
		}
	}

	function handleHebrewYearChange(value) {
		const year = clampYear(value);
		const month = normalizeHebrewMonthForYear(year, hebrewMonth);
		const maxDay = getHebrewMonthLength(year, month);
		const day = Math.min(hebrewDay, maxDay);
		setHebrewYear(year);
		setHebrewMonth(month);
		setHebrewDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHebrew({ year, month, day });
		}
	}

	const hebrewResult = gregorianDate
		? (() => {
				try {
					return gregorianDateToHebrew(gregorianDate);
				} catch {
					return null;
				}
			})()
		: null;

	const gregorianResult = isValidHebrewParts(hebrewParts)
		? (() => {
				try {
					return hebrewPartsToGregorian(hebrewParts);
				} catch {
					return null;
				}
			})()
		: null;

	return (
		<div className="hbc-tool">
			<div className="hbc-grid">
				<div className="hbc-card">
					<h2 className="hbc-card-title">Gregorian date</h2>
					<DateInput
						id="hbc-gregorian"
						label="Enter a Gregorian date"
						value={gregorianDisplay}
						onChange={handleGregorianChange}
					/>
					{gregorianError && <p className="hbc-error">{gregorianError}</p>}
					<div className="hbc-output" aria-live="polite">
						<div className="hbc-output-label">Hebrew (Jewish) date</div>
						{hebrewResult ? (
							<>
								<div className="hbc-output-main">
									{formatHebrewLong(hebrewResult)}
								</div>
								<div className="hbc-output-sub">
									{hebrewResult.day} / {hebrewResult.month} / {hebrewResult.year}
								</div>
							</>
						) : (
							<div className="hbc-output-placeholder">—</div>
						)}
					</div>
				</div>

				<div className="hbc-card">
					<h2 className="hbc-card-title">Hebrew date</h2>
					<div className="hbc-hebrew-fields">
						<div className="hbc-hebrew-row">
							<div className="date-input-wrap-default hbc-hebrew-day-wrap">
								<label
									className="date-input-label-default"
									htmlFor="hbc-hebrew-day"
								>
									Day
								</label>
								<input
									id="hbc-hebrew-day"
									type="number"
									className="date-input-default hbc-hebrew-day"
									min={1}
									max={monthLength}
									value={hebrewDay}
									onChange={(e) => handleHebrewDayChange(e.target.value)}
								/>
							</div>
							<div className="date-input-wrap-default hbc-hebrew-month-wrap">
								<label
									className="date-input-label-default"
									htmlFor="hbc-hebrew-month"
								>
									Month
								</label>
								<select
									id="hbc-hebrew-month"
									className="date-input-default hbc-hebrew-select"
									value={hebrewMonth}
									onChange={(e) => handleHebrewMonthChange(e.target.value)}
								>
									{monthOptions.map(({ num, name }) => (
										<option key={num} value={num}>
											{name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="date-input-wrap-default">
							<label
								className="date-input-label-default"
								htmlFor="hbc-hebrew-year"
							>
								Year (AM)
							</label>
							<input
								id="hbc-hebrew-year"
								type="number"
								className="date-input-default"
								min={HEBREW_YEAR_MIN}
								max={HEBREW_YEAR_MAX}
								value={hebrewYear}
								onChange={(e) => handleHebrewYearChange(e.target.value)}
							/>
						</div>
					</div>
					{hebrewError && <p className="hbc-error">{hebrewError}</p>}
					<div className="hbc-output" aria-live="polite">
						<div className="hbc-output-label">Gregorian date</div>
						{gregorianResult ? (
							<>
								<div className="hbc-output-main">
									{formatGregorianLong(gregorianResult)}
								</div>
								<div className="hbc-output-sub">
									{dateToDisplay(gregorianResult)}
								</div>
							</>
						) : (
							<div className="hbc-output-placeholder">—</div>
						)}
					</div>
				</div>
			</div>

			<div className="hbc-reference">
				<p className="hbc-reference-title">Hebcal reference dates</p>
				<ul className="hbc-reference-list">
					<li>8 July 2026 — 23 Tamuz 5786</li>
					<li>1 Tishrei 5787 (Rosh Hashana) — 12 September 2026</li>
					<li>25 Kislev 5787 — 5 December 2026</li>
				</ul>
			</div>

			<p className="hbc-disclaimer">
				Dates use the standard Hebrew calendar rules as implemented by Hebcal
				(@hebcal/core). Jewish holidays that begin at sundown may be observed on
				the preceding Gregorian evening.
			</p>
		</div>
	);
}
