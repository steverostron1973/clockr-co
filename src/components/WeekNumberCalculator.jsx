import { useEffect, useMemo, useState } from 'react';

function toInputValue(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function parseInputValue(value) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function getISOWeekInfo(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { week, year: d.getUTCFullYear() };
}

function getISOWeeksInYear(isoYear) {
	const dec28 = new Date(isoYear, 11, 28);
	return getISOWeekInfo(dec28).week;
}

function getWeekRange(date) {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const day = d.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	const monday = new Date(d);
	monday.setDate(d.getDate() + diff);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	return { monday, sunday };
}

function formatWeekRange(monday, sunday) {
	const monStr = monday.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});
	const sunStr = sunday.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${monStr} – ${sunStr}`;
}

function getPresetDate(preset, currentYear) {
	const today = new Date();
	switch (preset) {
		case 'this-week':
			return today;
		case 'next-week': {
			const d = new Date(today);
			d.setDate(d.getDate() + 7);
			return d;
		}
		case 'last-week': {
			const d = new Date(today);
			d.setDate(d.getDate() - 7);
			return d;
		}
		case 'jan-1':
			return new Date(currentYear, 0, 1);
		case 'jul-1':
			return new Date(currentYear, 6, 1);
		case 'dec-31':
			return new Date(currentYear, 11, 31);
		default:
			return today;
	}
}

export default function WeekNumberCalculator() {
	const currentYear = useMemo(() => new Date().getFullYear(), []);

	const [dateValue, setDateValue] = useState(() => toInputValue(new Date()));
	const [result, setResult] = useState(null);

	useEffect(() => {
		if (!dateValue) {
			setResult(null);
			return;
		}

		const date = parseInputValue(dateValue);
		if (isNaN(date.getTime())) {
			setResult(null);
			return;
		}

		const { week, year } = getISOWeekInfo(date);
		const { monday, sunday } = getWeekRange(date);
		const totalWeeks = getISOWeeksInYear(year);
		const weeksRemaining = totalWeeks - week;

		setResult({
			week,
			year,
			range: formatWeekRange(monday, sunday),
			weeksRemaining,
			totalWeeks,
		});
	}, [dateValue]);

	function handlePreset(preset) {
		const d = getPresetDate(preset, currentYear);
		setDateValue(toInputValue(d));
		document.getElementById('wnc-results')?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}

	const quickLinks = [
		{ preset: 'this-week', label: 'This week' },
		{ preset: 'next-week', label: 'Next week' },
		{ preset: 'last-week', label: 'Last week' },
		{ preset: 'jan-1', label: `1 January ${currentYear}` },
		{ preset: 'jul-1', label: `1 July ${currentYear}` },
		{ preset: 'dec-31', label: `31 December ${currentYear}` },
	];

	return (
		<>
			<div className="wnc-input-wrap">
				<label className="wnc-label" htmlFor="wnc-date-input">
					Enter a date
				</label>
				<input
					type="date"
					id="wnc-date-input"
					className="wnc-input"
					value={dateValue}
					onChange={(e) => setDateValue(e.target.value)}
				/>
			</div>

			{result && (
				<div className="wnc-results" id="wnc-results">
					<div className="wnc-main-card">
						<div className="wnc-week-title">
							Week {result.week} of {result.year}
						</div>
						<div className="wnc-week-range">{result.range}</div>
						<div className="wnc-remaining">
							{result.weeksRemaining === 0
								? `This is the final week of ${result.year}`
								: result.weeksRemaining === 1
									? `1 week remains in ${result.year}`
									: `${result.weeksRemaining} weeks remain in ${result.year}`}
						</div>
					</div>
				</div>
			)}

			<div className="wnc-quick">
				<h2 className="wnc-section-title">What week is…</h2>
				<div className="wnc-quick-grid">
					{quickLinks.map((link) => (
						<button
							key={link.preset}
							type="button"
							className="wnc-quick-btn"
							onClick={() => handlePreset(link.preset)}
						>
							{link.label}
						</button>
					))}
				</div>
			</div>
		</>
	);
}
