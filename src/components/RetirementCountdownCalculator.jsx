import { useMemo, useState } from 'react';

const WORKING_LIFE_START_AGE = 21;
const DEFAULT_RETIREMENT_AGE = 67;

const RETIREMENT_PRESETS = [
	{ label: 'Age 60', age: 60 },
	{ label: 'Age 65', age: 65 },
	{ label: 'Age 67 (UK State Pension)', age: 67 },
	{ label: 'Age 70', age: 70 },
];

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addYears(d, years) {
	const out = new Date(d);
	out.setFullYear(out.getFullYear() + years);
	return startOfDay(out);
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
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

function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}

function computeResult(birthDate, retirementAge, today) {
	const retirementDate = addYears(birthDate, retirementAge);
	const workingLifeStart = addYears(birthDate, WORKING_LIFE_START_AGE);

	const isPastRetirement = today.getTime() >= retirementDate.getTime();
	const countdownFrom = isPastRetirement ? retirementDate : today;
	const countdownTo = isPastRetirement ? today : retirementDate;

	const { years, months, days } = diffYmd(countdownFrom, countdownTo);
	const totalDaysRemaining = isPastRetirement
		? 0
		: Math.max(0, diffDays(today, retirementDate));

	const workingLifeTotalDays = diffDays(workingLifeStart, retirementDate);
	const workingLifeElapsedDays = diffDays(workingLifeStart, today);
	const progressPct =
		workingLifeTotalDays > 0
			? clamp((workingLifeElapsedDays / workingLifeTotalDays) * 100, 0, 100)
			: 100;

	return {
		retirementDate,
		retirementDateFormatted: formatDateLong(retirementDate),
		years,
		months,
		days,
		totalDaysRemaining,
		progressPct,
		isPastRetirement,
		workingLifeStartAge: WORKING_LIFE_START_AGE,
	};
}

export default function RetirementCountdownCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [dateValue, setDateValue] = useState('');
	const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE);

	const birthDate = useMemo(() => parseInputValue(dateValue), [dateValue]);

	const validRetirementAge =
		Number.isFinite(retirementAge) && retirementAge >= 1 && retirementAge <= 120;

	const result = useMemo(() => {
		if (!birthDate || !validRetirementAge) return null;
		return computeResult(birthDate, retirementAge, today);
	}, [birthDate, retirementAge, validRetirementAge, today]);

	function handleAgeChange(e) {
		const raw = e.target.value;
		if (raw === '') {
			setRetirementAge('');
			return;
		}
		const parsed = parseInt(raw, 10);
		if (!Number.isNaN(parsed)) {
			setRetirementAge(parsed);
		}
	}

	return (
		<div className="rcc-tool">
			<style>{`
				#rcc-date-input {
					text-align: center;
				}
				#rcc-date-input::-webkit-datetime-edit,
				#rcc-date-input::-webkit-datetime-edit-fields-wrapper {
					display: flex;
					justify-content: center;
					width: 100%;
					text-align: center;
				}
				#rcc-date-input::-webkit-datetime-edit-day-field,
				#rcc-date-input::-webkit-datetime-edit-month-field,
				#rcc-date-input::-webkit-datetime-edit-year-field {
					text-align: center;
				}
			`}</style>

			<div className="rcc-card">
				<div className="rcc-inputs">
					<div className="rcc-input-wrap">
						<label className="rcc-label" htmlFor="rcc-date-input">
							Your date of birth
						</label>
						<input
							id="rcc-date-input"
							type="date"
							className="rcc-input"
							value={dateValue}
							onChange={(e) => setDateValue(e.target.value)}
							max={toInputValue(today)}
						/>
					</div>

					<div className="rcc-input-wrap">
						<label className="rcc-label" htmlFor="rcc-age-input">
							Retirement age
						</label>
						<input
							id="rcc-age-input"
							type="number"
							className="rcc-input rcc-input--number"
							value={retirementAge}
							onChange={handleAgeChange}
							min={1}
							max={120}
							aria-describedby="rcc-age-note"
						/>
						<p className="rcc-note" id="rcc-age-note">
							UK State Pension age is currently 67 (rising to 68 between
							2044–46). You can enter any age if you&apos;re planning for a
							private pension or different retirement target.
						</p>
					</div>
				</div>
			</div>

			<section className="rcc-presets" aria-label="Common retirement ages">
				<h2 className="rcc-presets-title">Common retirement ages</h2>
				<div className="rcc-presets-grid">
					{RETIREMENT_PRESETS.map((preset) => (
						<button
							key={preset.age}
							type="button"
							className="rcc-preset"
							onClick={() => setRetirementAge(preset.age)}
						>
							{preset.label}
						</button>
					))}
				</div>
			</section>

			{result && (
				<div className="rcc-results" aria-live="polite">
					<div className="rcc-main">
						<h2 className="rcc-main-heading">
							{result.isPastRetirement
								? `You reached retirement age on: ${result.retirementDateFormatted}`
								: `You can retire on: ${result.retirementDateFormatted}`}
						</h2>
					</div>

					{!result.isPastRetirement && (
						<div className="rcc-countdown">
							<div className="rcc-countdown-item">
								<span className="rcc-countdown-num">{result.years}</span>
								<span className="rcc-countdown-label">Years</span>
							</div>
							<div className="rcc-countdown-item">
								<span className="rcc-countdown-num">{result.months}</span>
								<span className="rcc-countdown-label">Months</span>
							</div>
							<div className="rcc-countdown-item">
								<span className="rcc-countdown-num">{result.days}</span>
								<span className="rcc-countdown-label">Days</span>
							</div>
						</div>
					)}

					<p className="rcc-total-days">
						{result.isPastRetirement
							? 'Your selected retirement date has already passed'
							: `${result.totalDaysRemaining.toLocaleString('en-GB')} days remaining`}
					</p>

					<div className="rcc-progress">
						<div className="rcc-progress-top">
							<span>Age {result.workingLifeStartAge}</span>
							<span>Age {retirementAge}</span>
						</div>
						<div
							className="rcc-progress-track"
							role="progressbar"
							aria-valuenow={Math.round(result.progressPct)}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label="Working life progress"
						>
							<div
								className="rcc-progress-fill"
								style={{ width: `${result.progressPct}%` }}
							/>
						</div>
						<p className="rcc-progress-note">
							Progress assumes a working life starting at age{' '}
							{result.workingLifeStartAge}. This is a simplified estimate for
							planning purposes only.
						</p>
					</div>

					<div className="rcc-disclaimer" role="note">
						This is an estimate for planning purposes only. Always check your
						exact State Pension age and any workplace or private pension details
						with the relevant provider.
					</div>
				</div>
			)}
		</div>
	);
}
