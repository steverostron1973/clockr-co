import { useMemo, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';

/** Synodic month length (days). */
export const LUNAR_CYCLE = 29.53058867;

/** Reference new moon: 6 January 2000, 18:14 UTC. */
export const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

export const PHASE_NAMES = [
	'New Moon',
	'Waxing Crescent',
	'First Quarter',
	'Waxing Gibbous',
	'Full Moon',
	'Waning Gibbous',
	'Last Quarter',
	'Waning Crescent',
];

function startOfLocalDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function localNoonUtcMs(d) {
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

function addDays(date, days) {
	const result = startOfLocalDay(date);
	result.setDate(result.getDate() + Math.round(days));
	return result;
}

function formatDateLong(date) {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function formatDaysLabel(days) {
	const rounded = Math.max(0, Math.round(days * 10) / 10);
	if (rounded < 0.1) return 'Today';
	if (rounded === 1) return '1 day';
	return `${rounded} days`;
}

function daysUntilPhase(cycleDay, targetDay) {
	let diff = targetDay - cycleDay;
	if (diff <= 0.01) diff += LUNAR_CYCLE;
	return diff;
}

export function getMoonPhaseData(date = new Date()) {
	const d = startOfLocalDay(date);
	const daysSince = (localNoonUtcMs(d) - KNOWN_NEW_MOON_UTC) / 86400000;
	let cycleDay = daysSince % LUNAR_CYCLE;
	if (cycleDay < 0) cycleDay += LUNAR_CYCLE;

	const illumination =
		((1 - Math.cos((2 * Math.PI * cycleDay) / LUNAR_CYCLE)) / 2) * 100;
	const isWaxing = cycleDay < LUNAR_CYCLE / 2;

	let phaseIndex;
	if (illumination < 2) {
		phaseIndex = 0; // New Moon
	} else if (illumination > 98) {
		phaseIndex = 4; // Full Moon
	} else if (isWaxing) {
		if (illumination < 40) phaseIndex = 1; // Waxing Crescent
		else if (illumination < 60) phaseIndex = 2; // First Quarter
		else phaseIndex = 3; // Waxing Gibbous
	} else if (illumination > 60) {
		phaseIndex = 5; // Waning Gibbous
	} else if (illumination > 40) {
		phaseIndex = 6; // Last Quarter
	} else {
		phaseIndex = 7; // Waning Crescent
	}

	const phaseName = PHASE_NAMES[phaseIndex];

	const daysUntilFull = daysUntilPhase(cycleDay, LUNAR_CYCLE / 2);
	const daysUntilNew = daysUntilPhase(cycleDay, 0);

	return {
		phaseName,
		phaseIndex,
		illumination: Math.round(illumination),
		daysUntilFull,
		daysUntilNew,
		nextFullMoon: addDays(d, daysUntilFull),
		nextNewMoon: addDays(d, daysUntilNew),
		cycleDay,
		lunarDay: Math.min(Math.floor(cycleDay) + 1, 30),
	};
}

function MoonPhaseIcon({ phaseIndex }) {
	const fill = 'url(#mpc-moon-grad)';
	const shade = '#0c0c0c';

	return (
		<svg
			className="mpc-moon-svg"
			viewBox="0 0 120 120"
			width="120"
			height="120"
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="mpc-moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#2D6A4F" />
					<stop offset="100%" stopColor="#74B49B" />
				</linearGradient>
				<clipPath id="mpc-moon-clip">
					<circle cx="60" cy="60" r="48" />
				</clipPath>
			</defs>

			{/* Base disc */}
			<circle cx="60" cy="60" r="48" fill={fill} />

			{/* Phase shadow overlays */}
			{phaseIndex === 0 && (
				<circle cx="60" cy="60" r="48" fill={shade} opacity="0.92" />
			)}
			{phaseIndex === 1 && (
				<g clipPath="url(#mpc-moon-clip)">
					<ellipse cx="36" cy="60" rx="40" ry="48" fill={shade} opacity="0.88" />
				</g>
			)}
			{phaseIndex === 2 && (
				<g clipPath="url(#mpc-moon-clip)">
					<rect x="12" y="12" width="48" height="96" fill={shade} opacity="0.88" />
				</g>
			)}
			{phaseIndex === 3 && (
				<g clipPath="url(#mpc-moon-clip)">
					<ellipse cx="28" cy="60" rx="28" ry="48" fill={shade} opacity="0.88" />
				</g>
			)}
			{phaseIndex === 5 && (
				<g clipPath="url(#mpc-moon-clip)">
					<ellipse cx="92" cy="60" rx="28" ry="48" fill={shade} opacity="0.88" />
				</g>
			)}
			{phaseIndex === 6 && (
				<g clipPath="url(#mpc-moon-clip)">
					<rect x="60" y="12" width="48" height="96" fill={shade} opacity="0.88" />
				</g>
			)}
			{phaseIndex === 7 && (
				<g clipPath="url(#mpc-moon-clip)">
					<ellipse cx="84" cy="60" rx="40" ry="48" fill={shade} opacity="0.88" />
				</g>
			)}

			{/* Subtle rim */}
			<circle
				cx="60"
				cy="60"
				r="48"
				fill="none"
				stroke="rgba(116, 180, 155, 0.45)"
				strokeWidth="2"
			/>
		</svg>
	);
}

export default function MoonPhaseCalculator() {
	const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay(new Date()));
	const [display, setDisplay] = useState(() => dateToDisplay(startOfLocalDay(new Date())));

	const result = useMemo(() => {
		if (!selectedDate) return null;
		return getMoonPhaseData(selectedDate);
	}, [selectedDate]);

	function handleDateChange(parsed, masked) {
		setDisplay(masked);
		setSelectedDate(parsed ? startOfLocalDay(parsed) : null);
	}

	return (
		<div className="mpc-tool">
			<div className="mpc-date-wrap">
				<DateInput
					id="mpc-date"
					label="Date"
					value={display}
					onChange={handleDateChange}
				/>
			</div>

			{result && (
				<section className="mpc-results" aria-live="polite">
					<div className="mpc-hero">
						<div className="mpc-moon-display">
							<MoonPhaseIcon phaseIndex={result.phaseIndex} />
						</div>
						<p className="mpc-result-date">{formatDateLong(selectedDate)}</p>
						<h2 className="mpc-phase-name">{result.phaseName}</h2>
						<p className="mpc-illumination">{result.illumination}% illuminated</p>
					</div>

					<div className="mpc-stats-grid">
						<div className="mpc-stat-card">
							<div className="mpc-stat-num">
								{formatDaysLabel(result.daysUntilFull)}
							</div>
							<div className="mpc-stat-label">Days until next Full Moon</div>
						</div>
						<div className="mpc-stat-card">
							<div className="mpc-stat-num">
								{formatDaysLabel(result.daysUntilNew)}
							</div>
							<div className="mpc-stat-label">Days until next New Moon</div>
						</div>
					</div>

					<div className="mpc-upcoming">
						<p className="mpc-upcoming-row">
							<span className="mpc-upcoming-label">Next full moon</span>
							<span className="mpc-upcoming-date">
								{formatDateLong(result.nextFullMoon)}
							</span>
						</p>
						<p className="mpc-upcoming-row">
							<span className="mpc-upcoming-label">Next new moon</span>
							<span className="mpc-upcoming-date">
								{formatDateLong(result.nextNewMoon)}
							</span>
						</p>
					</div>
				</section>
			)}

			{!selectedDate && (
				<p className="mpc-hint">Enter a valid date to see the moon phase.</p>
			)}
		</div>
	);
}
