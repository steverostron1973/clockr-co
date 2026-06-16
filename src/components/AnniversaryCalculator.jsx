import { useMemo, useState } from 'react';

const MILESTONE_YEARS = [1, 5, 10, 25, 50];

const QUICK_PRESETS = [
	{ label: '1 year ago today', years: 1 },
	{ label: '5 years ago today', years: 5 },
	{ label: '10 years ago today', years: 10 },
	{ label: '25 years ago today', years: 25 },
];

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function subtractYears(d, years) {
	const out = new Date(d);
	out.setFullYear(out.getFullYear() - years);
	return startOfDay(out);
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function isLeapYear(year) {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function anniversaryInYear(year, month, day) {
	if (month === 1 && day === 29 && !isLeapYear(year)) {
		return new Date(year, 1, 28);
	}
	return new Date(year, month, day);
}

function parseInputValue(value) {
	if (!value) return null;
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return null;
	const d = new Date(year, month - 1, day);
	if (Number.isNaN(d.getTime())) return null;
	return startOfDay(d);
}

function toInputValue(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function formatDateLong(d) {
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function diffYmd(from, to) {
	let years = to.getFullYear() - from.getFullYear();
	let months = to.getMonth() - from.getMonth();
	let days = to.getDate() - from.getDate();

	if (days < 0) {
		months--;
		days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
	}
	if (months < 0) {
		years--;
		months += 12;
	}

	return { years, months, days };
}

function getNextAnniversary(anniversaryDate, today) {
	const month = anniversaryDate.getMonth();
	const day = anniversaryDate.getDate();
	const year = today.getFullYear();

	let next = anniversaryInYear(year, month, day);
	if (today.getTime() >= next.getTime()) {
		next = anniversaryInYear(year + 1, month, day);
	}

	return next;
}

function ordinal(n) {
	const s = ['th', 'st', 'nd', 'rd'];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function computeResult(anniversaryDate, today, celebrationLabel) {
	const isFuture = anniversaryDate.getTime() > today.getTime();
	const earlier = isFuture ? today : anniversaryDate;
	const later = isFuture ? anniversaryDate : today;

	const { years, months, days } = diffYmd(earlier, later);
	const totalDays = Math.abs(diffDays(anniversaryDate, today));

	let nextAnniversary;
	let daysUntilNext;

	if (isFuture) {
		nextAnniversary = anniversaryDate;
		daysUntilNext = diffDays(today, anniversaryDate);
	} else {
		nextAnniversary = getNextAnniversary(anniversaryDate, today);
		daysUntilNext = diffDays(today, nextAnniversary);
	}

	const anniversaryNumber =
		nextAnniversary.getFullYear() - anniversaryDate.getFullYear();
	const isMilestone = MILESTONE_YEARS.includes(anniversaryNumber);

	const headingPrefix = celebrationLabel ? `${celebrationLabel}: ` : '';
	const direction = isFuture ? 'until' : 'since';

	return {
		heading: `${headingPrefix}${years} years, ${months} months, ${days} days ${direction}`,
		totalDays,
		daysUntilNext,
		nextAnniversary,
		anniversaryNumber,
		milestoneNote: isMilestone
			? `Your ${ordinal(anniversaryNumber)} anniversary is coming up on ${formatDateLong(nextAnniversary)}!`
			: null,
		isFuture,
	};
}

export default function AnniversaryCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [dateValue, setDateValue] = useState('');
	const [celebrationLabel, setCelebrationLabel] = useState('');

	const anniversaryDate = useMemo(() => parseInputValue(dateValue), [dateValue]);

	const result = useMemo(() => {
		if (!anniversaryDate) return null;
		return computeResult(anniversaryDate, today, celebrationLabel.trim());
	}, [anniversaryDate, today, celebrationLabel]);

	function applyPreset(years) {
		const presetDate = subtractYears(today, years);
		setDateValue(toInputValue(presetDate));
	}

	return (
		<div className="anc-tool">
			<style>{`
				#anc-date-input {
					text-align: center;
				}
				#anc-date-input::-webkit-datetime-edit,
				#anc-date-input::-webkit-datetime-edit-fields-wrapper {
					display: flex;
					justify-content: center;
					width: 100%;
					text-align: center;
				}
				#anc-date-input::-webkit-datetime-edit-day-field,
				#anc-date-input::-webkit-datetime-edit-month-field,
				#anc-date-input::-webkit-datetime-edit-year-field {
					text-align: center;
				}
			`}</style>
			<div className="anc-card">
				<div className="anc-inputs">
					<div className="anc-input-wrap">
						<label className="anc-label" htmlFor="anc-date-input">
							Anniversary date
						</label>
						<input
							id="anc-date-input"
							type="date"
							className="anc-input"
							value={dateValue}
							onChange={(e) => setDateValue(e.target.value)}
						/>
					</div>

					<div className="anc-input-wrap">
						<label className="anc-label" htmlFor="anc-label-input">
							Label (optional)
						</label>
						<input
							id="anc-label-input"
							type="text"
							className="anc-input anc-input--text"
							value={celebrationLabel}
							onChange={(e) => setCelebrationLabel(e.target.value)}
							placeholder="e.g. Wedding, First date, Anniversary"
							maxLength={80}
						/>
					</div>
				</div>
			</div>

			<section className="anc-presets" aria-label="Popular anniversaries">
				<h2 className="anc-presets-title">Popular anniversaries</h2>
				<div className="anc-presets-grid">
					{QUICK_PRESETS.map((preset) => (
						<button
							key={preset.years}
							type="button"
							className="anc-preset"
							onClick={() => applyPreset(preset.years)}
						>
							{preset.label}
						</button>
					))}
				</div>
			</section>

			{result && (
				<div className="anc-results" aria-live="polite">
					<div className="anc-main">
						<h2 className="anc-main-heading">{result.heading}</h2>
						<p className="anc-total-days">
							{result.totalDays.toLocaleString('en-GB')} days
						</p>
					</div>

					<div className="anc-next">
						<p className="anc-next-line">
							Your next anniversary is in{' '}
							<strong>{result.daysUntilNext.toLocaleString('en-GB')} days</strong>
						</p>
						<p className="anc-next-date">{formatDateLong(result.nextAnniversary)}</p>
					</div>

					{result.milestoneNote && (
						<p className="anc-milestone" role="note">
							{result.milestoneNote}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
