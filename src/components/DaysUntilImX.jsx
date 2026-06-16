import { useMemo, useState } from 'react';

const MILESTONE_AGES = [18, 21, 30, 40, 50, 65];

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

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addYears(d, years) {
	const out = new Date(d);
	out.setFullYear(out.getFullYear() + years);
	return startOfDay(out);
}

function addAge(birthDate, age) {
	const wholeYears = Math.floor(age);
	const fraction = age - wholeYears;
	let result = addYears(birthDate, wholeYears);
	if (fraction > 0) {
		const extraMonths = Math.round(fraction * 12);
		result = new Date(result);
		result.setMonth(result.getMonth() + extraMonths);
		return startOfDay(result);
	}
	return result;
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
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

function formatDateLong(d) {
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function formatDayOfWeek(d) {
	return d.toLocaleDateString('en-GB', { weekday: 'long' });
}

function formatAgeDisplay(age) {
	if (Number.isInteger(age)) return String(age);
	return parseFloat(age.toFixed(2)).toString();
}

function parseAgeInput(raw) {
	if (raw === '' || raw === '.') return null;
	const parsed = parseFloat(raw);
	if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 120) return null;
	return parsed;
}

function computeResult(birthDate, targetAge, today) {
	const milestoneDate = addAge(birthDate, targetAge);
	const ageLabel = formatAgeDisplay(targetAge);
	const dateFormatted = formatDateLong(milestoneDate);
	const dayOfWeek = formatDayOfWeek(milestoneDate);
	const isPast = today.getTime() > milestoneDate.getTime();

	if (isPast) {
		const daysAgo = diffDays(milestoneDate, today);
		return {
			isPast: true,
			ageLabel,
			dateFormatted,
			dayOfWeek,
			daysAgo,
			heading: `Age ${ageLabel} milestone`,
			pastNote: `You turned ${ageLabel} on ${dateFormatted}, which was ${daysAgo.toLocaleString('en-GB')} days ago`,
		};
	}

	const { years, months, days } = diffYmd(today, milestoneDate);
	const totalDaysRemaining = Math.max(0, diffDays(today, milestoneDate));

	return {
		isPast: false,
		ageLabel,
		dateFormatted,
		dayOfWeek,
		years,
		months,
		days,
		totalDaysRemaining,
		heading: `You will be ${ageLabel} on ${dateFormatted}`,
	};
}

export default function DaysUntilImX() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [dateValue, setDateValue] = useState('');
	const [targetAgeRaw, setTargetAgeRaw] = useState('');

	const birthDate = useMemo(() => parseInputValue(dateValue), [dateValue]);

	const targetAge = useMemo(() => parseAgeInput(targetAgeRaw), [targetAgeRaw]);

	const result = useMemo(() => {
		if (!birthDate || targetAge === null) return null;
		return computeResult(birthDate, targetAge, today);
	}, [birthDate, targetAge, today]);

	function handleAgeChange(e) {
		const raw = e.target.value;
		if (raw === '') {
			setTargetAgeRaw('');
			return;
		}
		if (/^\d*\.?\d*$/.test(raw)) {
			setTargetAgeRaw(raw);
		}
	}

	return (
		<div className="duix-tool">
			<div className="duix-card">
				<style>{`
					#duix-birth-date {
						text-align: center;
					}
					#duix-birth-date::-webkit-datetime-edit,
					#duix-birth-date::-webkit-datetime-edit-fields-wrapper {
						display: flex;
						justify-content: center;
						width: 100%;
						text-align: center;
					}
					#duix-birth-date::-webkit-datetime-edit-day-field,
					#duix-birth-date::-webkit-datetime-edit-month-field,
					#duix-birth-date::-webkit-datetime-edit-year-field {
						text-align: center;
					}
				`}</style>
				<div className="duix-inputs">
					<div className="duix-input-wrap">
						<label className="duix-label" htmlFor="duix-birth-date">
							Your birth date
						</label>
						<input
							id="duix-birth-date"
							type="date"
							className="duix-input"
							value={dateValue}
							onChange={(e) => setDateValue(e.target.value)}
							max={toInputValue(today)}
						/>
					</div>

					<div className="duix-input-wrap">
						<label className="duix-label" htmlFor="duix-age-input">
							Target age
						</label>
						<input
							id="duix-age-input"
							type="text"
							inputMode="decimal"
							className="duix-input duix-input--number"
							value={targetAgeRaw}
							onChange={handleAgeChange}
							placeholder="e.g. 30"
							autoComplete="off"
							aria-label="Target age"
						/>
					</div>
				</div>
			</div>

			<section className="duix-presets" aria-label="Popular milestone ages">
				<h2 className="duix-presets-title">Popular milestone ages</h2>
				<div className="duix-presets-grid">
					{MILESTONE_AGES.map((age) => (
						<button
							key={age}
							type="button"
							className="duix-preset"
							onClick={() => setTargetAgeRaw(String(age))}
						>
							{age}
						</button>
					))}
				</div>
			</section>

			{result && (
				<div className="duix-results" aria-live="polite">
					<div className="duix-main">
						<h2 className="duix-main-heading">{result.heading}</h2>
					</div>

					{!result.isPast && (
						<>
							<div className="duix-countdown">
								<div className="duix-countdown-item">
									<span className="duix-countdown-num">{result.years}</span>
									<span className="duix-countdown-label">Years</span>
								</div>
								<div className="duix-countdown-item">
									<span className="duix-countdown-num">{result.months}</span>
									<span className="duix-countdown-label">Months</span>
								</div>
								<div className="duix-countdown-item">
									<span className="duix-countdown-num">{result.days}</span>
									<span className="duix-countdown-label">Days</span>
								</div>
							</div>

							<p className="duix-total-days">
								{result.totalDaysRemaining.toLocaleString('en-GB')} days remaining
							</p>
						</>
					)}

					<p className="duix-weekday">
						{result.isPast
							? `That was a ${result.dayOfWeek}`
							: `Your birthday falls on a ${result.dayOfWeek}`}
					</p>

					{result.isPast && (
						<p className="duix-past-note" role="note">
							{result.pastNote}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
