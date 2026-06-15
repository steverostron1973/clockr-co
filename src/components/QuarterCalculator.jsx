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

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayDiff(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function formatRangeDate(d) {
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatQuarterRange(start, end) {
	const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
	const endStr = formatRangeDate(end);
	return `${startStr} – ${endStr}`;
}

function getCalendarQuarterInfo(date) {
	const month = date.getMonth();
	const year = date.getFullYear();
	let quarter;

	if (month < 3) {
		quarter = 1;
	} else if (month < 6) {
		quarter = 2;
	} else if (month < 9) {
		quarter = 3;
	} else {
		quarter = 4;
	}

	const ranges = {
		1: { start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
		2: { start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
		3: { start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
		4: { start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
	};

	const { start, end } = ranges[quarter];
	return { quarter, year, start, end };
}

function getFiscalQuarterInfo(date) {
	const month = date.getMonth();
	const year = date.getFullYear();
	const fiscalYear = month >= 3 ? year + 1 : year;
	let quarter;

	if (month >= 3 && month < 6) {
		quarter = 1;
	} else if (month >= 6 && month < 9) {
		quarter = 2;
	} else if (month >= 9) {
		quarter = 3;
	} else {
		quarter = 4;
	}

	const ranges = {
		1: { start: new Date(fiscalYear - 1, 3, 1), end: new Date(fiscalYear - 1, 5, 30) },
		2: { start: new Date(fiscalYear - 1, 6, 1), end: new Date(fiscalYear - 1, 8, 30) },
		3: { start: new Date(fiscalYear - 1, 9, 1), end: new Date(fiscalYear - 1, 11, 31) },
		4: { start: new Date(fiscalYear, 0, 1), end: new Date(fiscalYear, 2, 31) },
	};

	const { start, end } = ranges[quarter];
	return { quarter, year: fiscalYear, start, end };
}

function getQuarterInfo(date, mode) {
	const info = mode === 'fiscal' ? getFiscalQuarterInfo(date) : getCalendarQuarterInfo(date);
	const daysElapsed = dayDiff(info.start, date) + 1;
	const daysRemaining = dayDiff(date, info.end);

	return {
		quarter: info.quarter,
		year: info.year,
		range: formatQuarterRange(info.start, info.end),
		daysElapsed,
		daysRemaining,
	};
}

function getQuarterStart(date, mode) {
	const { start } =
		mode === 'fiscal' ? getFiscalQuarterInfo(date) : getCalendarQuarterInfo(date);
	return start;
}

function getNextQuarterStart(date, mode) {
	const info = mode === 'fiscal' ? getFiscalQuarterInfo(date) : getCalendarQuarterInfo(date);
	const nextQuarter = info.quarter === 4 ? 1 : info.quarter + 1;
	const nextYear = info.quarter === 4 ? info.year + 1 : info.year;

	if (mode === 'fiscal') {
		const ranges = {
			1: new Date(nextYear - 1, 3, 1),
			2: new Date(nextYear - 1, 6, 1),
			3: new Date(nextYear - 1, 9, 1),
			4: new Date(nextYear, 0, 1),
		};
		return ranges[nextQuarter];
	}

	const ranges = {
		1: new Date(nextYear, 0, 1),
		2: new Date(nextYear, 3, 1),
		3: new Date(nextYear, 6, 1),
		4: new Date(nextYear, 9, 1),
	};
	return ranges[nextQuarter];
}

function getPresetDate(preset, currentYear, mode) {
	const today = new Date();
	switch (preset) {
		case 'today':
			return today;
		case 'next-quarter':
			return getNextQuarterStart(today, mode);
		case 'this-quarter':
			return getQuarterStart(today, mode);
		case 'jan-1':
			return new Date(currentYear, 0, 1);
		case 'apr-1':
			return new Date(currentYear, 3, 1);
		case 'dec-31':
			return new Date(currentYear, 11, 31);
		default:
			return today;
	}
}

export default function QuarterCalculator() {
	const currentYear = useMemo(() => new Date().getFullYear(), []);

	const [dateValue, setDateValue] = useState(() => toInputValue(new Date()));
	const [yearMode, setYearMode] = useState('calendar');
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

		setResult(getQuarterInfo(date, yearMode));
	}, [dateValue, yearMode]);

	function handlePreset(preset) {
		const d = getPresetDate(preset, currentYear, yearMode);
		setDateValue(toInputValue(d));
		document.getElementById('qc-results')?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}

	const quickLinks = [
		{ preset: 'today', label: 'Today' },
		{ preset: 'next-quarter', label: 'Start of next quarter' },
		{ preset: 'this-quarter', label: 'Start of this quarter' },
		{ preset: 'jan-1', label: `1 January ${currentYear}` },
		{ preset: 'apr-1', label: `1 April ${currentYear}` },
		{ preset: 'dec-31', label: `31 December ${currentYear}` },
	];

	return (
		<>
			<div className="qc-mode-wrap">
				<span className="qc-label">Year type</span>
				<div className="qc-mode-toggle" role="group" aria-label="Year type">
					<button
						type="button"
						className={`qc-mode-btn${yearMode === 'calendar' ? ' qc-mode-btn--active' : ''}`}
						onClick={() => setYearMode('calendar')}
						aria-pressed={yearMode === 'calendar'}
					>
						Calendar year
					</button>
					<button
						type="button"
						className={`qc-mode-btn${yearMode === 'fiscal' ? ' qc-mode-btn--active' : ''}`}
						onClick={() => setYearMode('fiscal')}
						aria-pressed={yearMode === 'fiscal'}
					>
						Fiscal year (UK: April–March)
					</button>
				</div>
			</div>

			<div className="qc-input-wrap">
				<label className="qc-label" htmlFor="qc-date-input">
					Enter a date
				</label>
				<input
					type="date"
					id="qc-date-input"
					className="qc-input"
					value={dateValue}
					onChange={(e) => setDateValue(e.target.value)}
				/>
			</div>

			{result && (
				<div className="qc-results" id="qc-results">
					<div className="qc-main-card">
						<div className="qc-quarter-title">
							Q{result.quarter} {result.year}
						</div>
						<div className="qc-quarter-range">{result.range}</div>
						<div className="qc-stats">
							<div className="qc-stat">
								<span className="qc-stat-num">{result.daysRemaining}</span>
								<span className="qc-stat-label">
									{result.daysRemaining === 1 ? 'day remaining' : 'days remaining'}
								</span>
							</div>
							<div className="qc-stat">
								<span className="qc-stat-num">{result.daysElapsed}</span>
								<span className="qc-stat-label">
									{result.daysElapsed === 1 ? 'day elapsed' : 'days elapsed'}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="qc-quick">
				<h2 className="qc-section-title">What quarter is…</h2>
				<div className="qc-quick-grid">
					{quickLinks.map((link) => (
						<button
							key={link.preset}
							type="button"
							className="qc-quick-btn"
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
