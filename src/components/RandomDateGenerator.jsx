import { useMemo, useState } from 'react';

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

function getISOWeekInfo(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { week, year: d.getUTCFullYear() };
}

function formatFullDate(d) {
	return d.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function formatDayOfWeek(d) {
	return d.toLocaleDateString('en-GB', { weekday: 'long' });
}

function formatRelativeDays(date, today) {
	const diff = dayDiff(today, date);
	if (diff === 0) return 'Today';
	if (diff > 0) {
		return diff === 1 ? '1 day from now' : `${diff.toLocaleString('en-GB')} days from now`;
	}
	const ago = Math.abs(diff);
	return ago === 1 ? '1 day ago' : `${ago.toLocaleString('en-GB')} days ago`;
}

function randomDateInRange(from, to) {
	const days = dayDiff(from, to);
	const offset = Math.floor(Math.random() * (days + 1));
	const result = new Date(from);
	result.setDate(result.getDate() + offset);
	return result;
}

function buildResult(date, today) {
	const { week, year } = getISOWeekInfo(date);
	return {
		fullDate: formatFullDate(date),
		dayOfWeek: formatDayOfWeek(date),
		weekNumber: week,
		isoYear: year,
		relative: formatRelativeDays(date, today),
	};
}

export default function RandomDateGenerator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [fromValue, setFromValue] = useState('2000-01-01');
	const [toValue, setToValue] = useState(() => toInputValue(today));
	const [result, setResult] = useState(null);
	const [animKey, setAnimKey] = useState(0);
	const [copied, setCopied] = useState(false);

	const fromDate = fromValue ? parseInputValue(fromValue) : null;
	const toDate = toValue ? parseInputValue(toValue) : null;
	const rangeInvalid =
		fromDate &&
		toDate &&
		!isNaN(fromDate.getTime()) &&
		!isNaN(toDate.getTime()) &&
		dayDiff(fromDate, toDate) < 0;

	function handleGenerate() {
		if (rangeInvalid || !fromDate || !toDate) return;

		const date = randomDateInRange(fromDate, toDate);
		setResult(buildResult(date, today));
		setAnimKey((k) => k + 1);
		setCopied(false);
	}

	async function handleCopy() {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(result.fullDate);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			/* clipboard unavailable */
		}
	}

	return (
		<>
			<div className="rdg-range-card">
				<div className="rdg-range-inputs">
					<div className="rdg-input-wrap">
						<label className="rdg-label" htmlFor="rdg-from-input">
							From
						</label>
						<input
							type="date"
							id="rdg-from-input"
							className="rdg-input"
							value={fromValue}
							min="0001-01-01"
							max="9999-12-31"
							onChange={(e) => setFromValue(e.target.value)}
						/>
					</div>
					<div className="rdg-input-wrap">
						<label className="rdg-label" htmlFor="rdg-to-input">
							To
						</label>
						<input
							type="date"
							id="rdg-to-input"
							className="rdg-input"
							value={toValue}
							min="0001-01-01"
							max="9999-12-31"
							onChange={(e) => setToValue(e.target.value)}
						/>
					</div>
				</div>

				{rangeInvalid && (
					<p className="rdg-error" role="alert">
						The &ldquo;From&rdquo; date must be on or before the &ldquo;To&rdquo; date.
					</p>
				)}

				<button
					type="button"
					className="rdg-generate"
					onClick={handleGenerate}
					disabled={rangeInvalid}
				>
					Generate
				</button>
			</div>

			{result && (
				<div className="rdg-results" id="rdg-results">
					<div className="rdg-result-header">
						<div
							key={animKey}
							className="rdg-main-card rdg-main-card--animate"
						>
							<div className="rdg-date-title">{result.fullDate}</div>
							<div className="rdg-stats">
								<div className="rdg-stat">
									<span className="rdg-stat-num">{result.dayOfWeek}</span>
									<span className="rdg-stat-label">Day of the week</span>
								</div>
								<div className="rdg-stat">
									<span className="rdg-stat-num">
										Week {result.weekNumber}
									</span>
									<span className="rdg-stat-label">
										ISO week of {result.isoYear}
									</span>
								</div>
								<div className="rdg-stat">
									<span className="rdg-stat-num">{result.relative}</span>
									<span className="rdg-stat-label">From today</span>
								</div>
							</div>
						</div>
						<button
							type="button"
							className="rdg-copy"
							onClick={handleCopy}
							aria-label="Copy result to clipboard"
						>
							{copied ? 'Copied!' : 'Copy result'}
						</button>
					</div>
				</div>
			)}
		</>
	);
}
