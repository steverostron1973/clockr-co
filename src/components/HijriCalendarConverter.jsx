import { useCallback, useMemo, useRef, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';
import {
	formatGregorianLong,
	formatHijriLong,
	getHijriMonthLength,
	gregorianDateToHijri,
	HIJRI_MONTHS,
	hijriPartsToGregorian,
	isValidHijriParts,
	startOfLocalDay,
} from '../data/hijriConversion';

function clampDay(day, maxDay) {
	const n = parseInt(String(day), 10);
	if (Number.isNaN(n)) return 1;
	return Math.min(maxDay, Math.max(1, n));
}

function clampYear(year) {
	const n = parseInt(String(year), 10);
	if (Number.isNaN(n)) return 1447;
	return Math.min(1500, Math.max(1343, n));
}

export default function HijriCalendarConverter() {
	const today = useMemo(() => startOfLocalDay(new Date()), []);
	const todayHijri = useMemo(() => gregorianDateToHijri(today), [today]);

	const syncSource = useRef(null);

	const [gregorianDate, setGregorianDate] = useState(today);
	const [gregorianDisplay, setGregorianDisplay] = useState(() =>
		dateToDisplay(today),
	);

	const [hijriDay, setHijriDay] = useState(todayHijri.day);
	const [hijriMonth, setHijriMonth] = useState(todayHijri.month);
	const [hijriYear, setHijriYear] = useState(todayHijri.year);

	const [gregorianError, setGregorianError] = useState('');
	const [hijriError, setHijriError] = useState('');

	const monthLength = useMemo(
		() => getHijriMonthLength(hijriYear, hijriMonth),
		[hijriYear, hijriMonth],
	);

	const hijriParts = useMemo(
		() => ({ year: hijriYear, month: hijriMonth, day: hijriDay }),
		[hijriYear, hijriMonth, hijriDay],
	);

	const syncFromGregorian = useCallback((date) => {
		try {
			const hijri = gregorianDateToHijri(date);
			syncSource.current = 'gregorian';
			setHijriDay(hijri.day);
			setHijriMonth(hijri.month);
			setHijriYear(hijri.year);
			setGregorianError('');
			setHijriError('');
			syncSource.current = null;
		} catch {
			setGregorianError('Date is outside the supported conversion range (1924–2077).');
		}
	}, []);

	const syncFromHijri = useCallback((parts) => {
		if (!isValidHijriParts(parts)) {
			setHijriError('Enter a valid Hijri date within the supported range.');
			return;
		}

		try {
			const greg = hijriPartsToGregorian(parts);
			syncSource.current = 'hijri';
			setGregorianDate(greg);
			setGregorianDisplay(dateToDisplay(greg));
			setGregorianError('');
			setHijriError('');
			syncSource.current = null;
		} catch {
			setHijriError('Date is outside the supported conversion range (1343–1500 AH).');
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
		if (syncSource.current !== 'hijri') {
			syncFromGregorian(date);
		}
	}

	function handleHijriDayChange(value) {
		const day = clampDay(value, monthLength);
		setHijriDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHijri({ year: hijriYear, month: hijriMonth, day });
		}
	}

	function handleHijriMonthChange(value) {
		const month = parseInt(value, 10);
		const maxDay = getHijriMonthLength(hijriYear, month);
		const day = Math.min(hijriDay, maxDay);
		setHijriMonth(month);
		setHijriDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHijri({ year: hijriYear, month, day });
		}
	}

	function handleHijriYearChange(value) {
		const year = clampYear(value);
		const maxDay = getHijriMonthLength(year, hijriMonth);
		const day = Math.min(hijriDay, maxDay);
		setHijriYear(year);
		setHijriDay(day);
		if (syncSource.current !== 'gregorian') {
			syncFromHijri({ year, month: hijriMonth, day });
		}
	}

	const hijriResult = gregorianDate
		? (() => {
				try {
					return gregorianDateToHijri(gregorianDate);
				} catch {
					return null;
				}
			})()
		: null;

	const gregorianResult = isValidHijriParts(hijriParts)
		? (() => {
				try {
					return hijriPartsToGregorian(hijriParts);
				} catch {
					return null;
				}
			})()
		: null;

	return (
		<div className="hcc-tool">
			<div className="hcc-grid">
				<div className="hcc-card">
					<h2 className="hcc-card-title">Gregorian date</h2>
					<DateInput
						id="hcc-gregorian"
						label="Enter a Gregorian date"
						value={gregorianDisplay}
						onChange={handleGregorianChange}
					/>
					{gregorianError && <p className="hcc-error">{gregorianError}</p>}
					<div className="hcc-output" aria-live="polite">
						<div className="hcc-output-label">Islamic (Hijri) date</div>
						{hijriResult ? (
							<>
								<div className="hcc-output-main">{formatHijriLong(hijriResult)}</div>
								<div className="hcc-output-sub">
									{hijriResult.day} / {hijriResult.month} / {hijriResult.year}
								</div>
							</>
						) : (
							<div className="hcc-output-placeholder">—</div>
						)}
					</div>
				</div>

				<div className="hcc-card">
					<h2 className="hcc-card-title">Hijri date</h2>
					<div className="hcc-hijri-fields">
						<div className="hcc-hijri-row">
							<div className="date-input-wrap-default hcc-hijri-day-wrap">
								<label className="date-input-label-default" htmlFor="hcc-hijri-day">
									Day
								</label>
								<input
									id="hcc-hijri-day"
									type="number"
									className="date-input-default hcc-hijri-day"
									min={1}
									max={monthLength}
									value={hijriDay}
									onChange={(e) => handleHijriDayChange(e.target.value)}
								/>
							</div>
							<div className="date-input-wrap-default hcc-hijri-month-wrap">
								<label
									className="date-input-label-default"
									htmlFor="hcc-hijri-month"
								>
									Month
								</label>
								<select
									id="hcc-hijri-month"
									className="date-input-default hcc-hijri-select"
									value={hijriMonth}
									onChange={(e) => handleHijriMonthChange(e.target.value)}
								>
									{HIJRI_MONTHS.map(({ num, name }) => (
										<option key={num} value={num}>
											{name}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="date-input-wrap-default">
							<label className="date-input-label-default" htmlFor="hcc-hijri-year">
								Year (AH)
							</label>
							<input
								id="hcc-hijri-year"
								type="number"
								className="date-input-default"
								min={1343}
								max={1500}
								value={hijriYear}
								onChange={(e) => handleHijriYearChange(e.target.value)}
							/>
						</div>
					</div>
					{hijriError && <p className="hcc-error">{hijriError}</p>}
					<div className="hcc-output" aria-live="polite">
						<div className="hcc-output-label">Gregorian date</div>
						{gregorianResult ? (
							<>
								<div className="hcc-output-main">
									{formatGregorianLong(gregorianResult)}
								</div>
								<div className="hcc-output-sub">
									{dateToDisplay(gregorianResult)}
								</div>
							</>
						) : (
							<div className="hcc-output-placeholder">—</div>
						)}
					</div>
				</div>
			</div>

			<div className="hcc-reference">
				<p className="hcc-reference-title">Umm al-Qura reference dates</p>
				<ul className="hcc-reference-list">
					<li>1 Muharram 1448 AH (Islamic New Year) — 16 June 2026</li>
					<li>12 Muharram 1448 AH — 27 June 2026</li>
					<li>23 Muharram 1448 AH — 8 July 2026</li>
					<li>1 Ramadan 1447 AH — 18 February 2026</li>
				</ul>
			</div>

			<p className="hcc-disclaimer">
				Dates use the Umm al-Qura astronomical calendar (as on our Ramadan and Eid
				countdowns). Local moon sighting may shift dates by a day in some regions.
			</p>
		</div>
	);
}
