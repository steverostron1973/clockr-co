import { useMemo, useState } from 'react';

const ZODIAC_SIGNS = [
	{ sign: 'Capricorn', start: [12, 22], end: [1, 19] },
	{ sign: 'Aquarius', start: [1, 20], end: [2, 18] },
	{ sign: 'Pisces', start: [2, 19], end: [3, 20] },
	{ sign: 'Aries', start: [3, 21], end: [4, 19] },
	{ sign: 'Taurus', start: [4, 20], end: [5, 20] },
	{ sign: 'Gemini', start: [5, 21], end: [6, 20] },
	{ sign: 'Cancer', start: [6, 21], end: [7, 22] },
	{ sign: 'Leo', start: [7, 23], end: [8, 22] },
	{ sign: 'Virgo', start: [8, 23], end: [9, 22] },
	{ sign: 'Libra', start: [9, 23], end: [10, 22] },
	{ sign: 'Scorpio', start: [10, 23], end: [11, 21] },
	{ sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
];

const QUICK_PRESETS = [
	{ label: 'Compare with someone 5 years older', offsetYears: -5 },
	{ label: 'Compare with someone 10 years older', offsetYears: -10 },
	{ label: 'Compare with someone 5 years younger', offsetYears: 5 },
	{ label: 'Compare with someone 10 years younger', offsetYears: 10 },
];

const DEMO_PERSON1 = new Date(1990, 5, 15);

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

function getStarSign(month, day) {
	const md = month * 100 + day;
	for (const { sign, start, end } of ZODIAC_SIGNS) {
		const startMd = start[0] * 100 + start[1];
		const endMd = end[0] * 100 + end[1];
		if (startMd > endMd) {
			if (md >= startMd || md <= endMd) return sign;
		} else if (md >= startMd && md <= endMd) {
			return sign;
		}
	}
	return 'Unknown';
}

function displayName(name, fallback) {
	const trimmed = name.trim();
	return trimmed || fallback;
}

function computeResult(person1Date, person2Date, person1Name, person2Name, today) {
	const name1 = displayName(person1Name, 'Person 1');
	const name2 = displayName(person2Name, 'Person 2');

	const earlier =
		person1Date.getTime() <= person2Date.getTime() ? person1Date : person2Date;
	const later =
		person1Date.getTime() <= person2Date.getTime() ? person2Date : person1Date;

	const { years, months, days } = diffYmd(earlier, later);
	const totalDays = Math.abs(diffDays(person1Date, person2Date));

	const age1 = diffYmd(person1Date, today).years;
	const age2 = diffYmd(person2Date, today).years;

	const sign1 = getStarSign(
		person1Date.getMonth() + 1,
		person1Date.getDate(),
	);
	const sign2 = getStarSign(
		person2Date.getMonth() + 1,
		person2Date.getDate(),
	);

	let zodiacNote;
	if (sign1 === sign2) {
		zodiacNote = `${name1} and ${name2} are both ${sign1}s — they share a star sign!`;
	} else {
		zodiacNote = `${name1} is a ${sign1} and ${name2} is a ${sign2}.`;
	}

	let heading;
	if (person1Date.getTime() < person2Date.getTime()) {
		heading = `${name1} is ${years} years, ${months} months, ${days} days older than ${name2}`;
	} else if (person1Date.getTime() > person2Date.getTime()) {
		heading = `${name1} is ${years} years, ${months} months, ${days} days younger than ${name2}`;
	} else {
		heading = `${name1} and ${name2} were born on the same day`;
	}

	return {
		heading,
		totalDays,
		age1,
		age2,
		name1,
		name2,
		zodiacNote,
	};
}

export default function AgeDifferenceCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [person1DateValue, setPerson1DateValue] = useState('');
	const [person2DateValue, setPerson2DateValue] = useState('');
	const [person1Name, setPerson1Name] = useState('');
	const [person2Name, setPerson2Name] = useState('');

	const person1Date = useMemo(
		() => parseInputValue(person1DateValue),
		[person1DateValue],
	);
	const person2Date = useMemo(
		() => parseInputValue(person2DateValue),
		[person2DateValue],
	);

	const result = useMemo(() => {
		if (!person1Date || !person2Date) return null;
		return computeResult(
			person1Date,
			person2Date,
			person1Name,
			person2Name,
			today,
		);
	}, [person1Date, person2Date, person1Name, person2Name, today]);

	function applyPreset(offsetYears) {
		const base = person1Date ?? DEMO_PERSON1;
		if (!person1Date) {
			setPerson1DateValue(toInputValue(DEMO_PERSON1));
		}
		setPerson2DateValue(toInputValue(addYears(base, offsetYears)));
	}

	return (
		<div className="agdc-tool">
			<style>{`
				#agdc-date-input-1,
				#agdc-date-input-2 {
					text-align: center;
				}
				#agdc-date-input-1::-webkit-datetime-edit,
				#agdc-date-input-1::-webkit-datetime-edit-fields-wrapper,
				#agdc-date-input-2::-webkit-datetime-edit,
				#agdc-date-input-2::-webkit-datetime-edit-fields-wrapper {
					display: flex;
					justify-content: center;
					width: 100%;
					text-align: center;
				}
				#agdc-date-input-1::-webkit-datetime-edit-day-field,
				#agdc-date-input-1::-webkit-datetime-edit-month-field,
				#agdc-date-input-1::-webkit-datetime-edit-year-field,
				#agdc-date-input-2::-webkit-datetime-edit-day-field,
				#agdc-date-input-2::-webkit-datetime-edit-month-field,
				#agdc-date-input-2::-webkit-datetime-edit-year-field {
					text-align: center;
				}
			`}</style>
			<div className="agdc-card">
				<div className="agdc-dates-row">
					<div className="agdc-person">
						<div className="agdc-input-wrap">
							<label className="agdc-label" htmlFor="agdc-name-input-1">
								Name (optional)
							</label>
							<input
								id="agdc-name-input-1"
								type="text"
								className="agdc-input agdc-input--text"
								value={person1Name}
								onChange={(e) => setPerson1Name(e.target.value)}
								placeholder="Person 1"
								maxLength={80}
							/>
						</div>
						<div className="agdc-input-wrap">
							<label className="agdc-label" htmlFor="agdc-date-input-1">
								Person 1&apos;s birth date
							</label>
							<input
								id="agdc-date-input-1"
								type="date"
								className="agdc-input"
								value={person1DateValue}
								onChange={(e) => setPerson1DateValue(e.target.value)}
								max={toInputValue(today)}
							/>
						</div>
					</div>

					<div className="agdc-person">
						<div className="agdc-input-wrap">
							<label className="agdc-label" htmlFor="agdc-name-input-2">
								Name (optional)
							</label>
							<input
								id="agdc-name-input-2"
								type="text"
								className="agdc-input agdc-input--text"
								value={person2Name}
								onChange={(e) => setPerson2Name(e.target.value)}
								placeholder="Person 2"
								maxLength={80}
							/>
						</div>
						<div className="agdc-input-wrap">
							<label className="agdc-label" htmlFor="agdc-date-input-2">
								Person 2&apos;s birth date
							</label>
							<input
								id="agdc-date-input-2"
								type="date"
								className="agdc-input"
								value={person2DateValue}
								onChange={(e) => setPerson2DateValue(e.target.value)}
								max={toInputValue(today)}
							/>
						</div>
					</div>
				</div>
			</div>

			<section className="agdc-presets" aria-label="Common comparisons">
				<h2 className="agdc-presets-title">Common comparisons</h2>
				<div className="agdc-presets-grid">
					{QUICK_PRESETS.map((preset) => (
						<button
							key={preset.offsetYears}
							type="button"
							className="agdc-preset"
							onClick={() => applyPreset(preset.offsetYears)}
						>
							{preset.label}
						</button>
					))}
				</div>
			</section>

			{result && (
				<div className="agdc-results" aria-live="polite">
					<div className="agdc-main">
						<h2 className="agdc-main-heading">{result.heading}</h2>
						<p className="agdc-total-days">
							{result.totalDays.toLocaleString('en-GB')} days
						</p>
					</div>

					<div className="agdc-ages">
						<div className="agdc-age-card">
							<p className="agdc-age-text">
								{result.name1}: <strong>{result.age1} years old</strong>
							</p>
						</div>
						<div className="agdc-age-card">
							<p className="agdc-age-text">
								{result.name2}: <strong>{result.age2} years old</strong>
							</p>
						</div>
					</div>

					<p className="agdc-zodiac" role="note">
						{result.zodiacNote}
					</p>
				</div>
			)}
		</div>
	);
}
