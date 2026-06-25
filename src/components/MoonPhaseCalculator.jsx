import { useEffect, useMemo, useState } from 'react';
import DateInput from './DateInput.jsx';

const LUNAR_CYCLE = 29.53059;
const KNOWN_NEW_MOON = new Date(2000, 0, 6);

const MOON_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

const FLOAT_LAYOUT = [
	{ size: 40, rotation: -12, top: '12%', side: '4%', delay: 0 },
	{ size: 28, rotation: 8, top: '30%', side: '10%', delay: 0.8 },
	{ size: 36, rotation: -6, top: '55%', side: '6%', delay: 1.6 },
	{ size: 32, rotation: 14, top: '72%', side: '12%', delay: 2.4 },
];

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(date, days) {
	const result = new Date(date);
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

function formatDays(days) {
	if (days < 1) return '< 1 day';
	const rounded = Math.round(days * 10) / 10;
	return `${rounded} day${rounded === 1 ? '' : 's'}`;
}

function daysUntilPhase(cycleDay, targetDay) {
	let diff = targetDay - cycleDay;
	if (diff <= 0) diff += LUNAR_CYCLE;
	return diff;
}

export function getMoonPhaseData(date = new Date()) {
	const d = startOfDay(date);
	const ref = startOfDay(KNOWN_NEW_MOON);
	const daysSince = (d.getTime() - ref.getTime()) / 86400000;
	let cycleDay = daysSince % LUNAR_CYCLE;
	if (cycleDay < 0) cycleDay += LUNAR_CYCLE;

	const illumination =
		((1 - Math.cos((2 * Math.PI * cycleDay) / LUNAR_CYCLE)) / 2) * 100;
	const isWaxing = cycleDay < LUNAR_CYCLE / 2;

	let phaseName;
	let emoji;

	if (illumination <= 1) {
		phaseName = 'New Moon';
		emoji = '🌑';
	} else if (illumination >= 99) {
		phaseName = 'Full Moon';
		emoji = '🌕';
	} else if (isWaxing) {
		if (illumination >= 47 && illumination <= 53) {
			phaseName = 'First Quarter';
			emoji = '🌓';
		} else if (illumination > 53) {
			phaseName = 'Waxing Gibbous';
			emoji = '🌔';
		} else {
			phaseName = 'Waxing Crescent';
			emoji = '🌒';
		}
	} else if (illumination >= 47 && illumination <= 53) {
		phaseName = 'Last Quarter';
		emoji = '🌗';
	} else if (illumination > 53) {
		phaseName = 'Waning Gibbous';
		emoji = '🌖';
	} else {
		phaseName = 'Waning Crescent';
		emoji = '🌘';
	}

	const daysUntilFull = daysUntilPhase(cycleDay, LUNAR_CYCLE / 2);
	const daysUntilNew = daysUntilPhase(cycleDay, 0);
	const nextFullMoon = addDays(d, daysUntilFull);
	const nextNewMoon = addDays(d, daysUntilNew);
	const cycleProgress = (cycleDay / LUNAR_CYCLE) * 100;
	const lunarDay = Math.min(Math.floor(cycleDay) + 1, 30);

	return {
		phaseName,
		emoji,
		illumination: Math.round(illumination),
		daysUntilFull,
		daysUntilNew,
		nextFullMoon,
		nextNewMoon,
		cycleProgress,
		lunarDay,
		cycleDay,
	};
}

export default function MoonPhaseCalculator() {
	const [mode, setMode] = useState('today');
	const [now, setNow] = useState(() => new Date());
	const [customDate, setCustomDate] = useState(null);
	const [customDisplay, setCustomDisplay] = useState('');

	useEffect(() => {
		if (mode !== 'today') return undefined;
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, [mode]);

	const activeDate = mode === 'today' ? now : customDate;

	const result = useMemo(() => {
		if (!activeDate) return null;
		return getMoonPhaseData(activeDate);
	}, [activeDate]);

	function handleDateChange(parsed, masked) {
		setCustomDisplay(masked);
		setCustomDate(parsed ? startOfDay(parsed) : null);
	}

	return (
		<div className="mpc-tool">
			<div className="mpc-mode-toggle" role="tablist" aria-label="Moon phase mode">
				<button
					type="button"
					className={`mpc-mode-btn${mode === 'today' ? ' mpc-mode-btn--active' : ''}`}
					role="tab"
					aria-selected={mode === 'today'}
					onClick={() => setMode('today')}
				>
					Today&apos;s moon phase
				</button>
				<button
					type="button"
					className={`mpc-mode-btn${mode === 'any' ? ' mpc-mode-btn--active' : ''}`}
					role="tab"
					aria-selected={mode === 'any'}
					onClick={() => setMode('any')}
				>
					Any date
				</button>
			</div>

			{mode === 'any' && (
				<div className="mpc-date-wrap">
					<DateInput
						id="mpc-date"
						label="Enter a date"
						value={customDisplay}
						onChange={handleDateChange}
					/>
				</div>
			)}

			{result && (
				<section className="mpc-hero-band" aria-label="Moon phase results">
					<div className="mpc-hero-decor" aria-hidden="true">
						{FLOAT_LAYOUT.map((layout, i) => (
							<span
								key={`moon-float-${MOON_EMOJIS[i]}-${layout.delay}`}
								className="mpc-float-emoji"
								style={{
									fontSize: `${layout.size}px`,
									top: layout.top,
									left: layout.side,
									'--rotation': `${layout.rotation}deg`,
									animationDelay: `${layout.delay}s`,
								}}
							>
								{MOON_EMOJIS[i]}
							</span>
						))}
						{FLOAT_LAYOUT.map((layout, i) => (
							<span
								key={`moon-float-r-${MOON_EMOJIS[i]}-${layout.delay}`}
								className="mpc-float-emoji mpc-float-emoji--right"
								style={{
									fontSize: `${layout.size}px`,
									top: layout.top,
									right: layout.side,
									'--rotation': `${layout.rotation}deg`,
									animationDelay: `${layout.delay + 1.2}s`,
								}}
							>
								{MOON_EMOJIS[(i + 4) % 8]}
							</span>
						))}
					</div>

					<div className="mpc-hero-centre">
						{mode === 'any' && activeDate && (
							<p className="mpc-result-date">{formatDateLong(activeDate)}</p>
						)}

						<div className="mpc-moon-display" aria-hidden="true">
							{result.emoji}
						</div>

						<h2 className="mpc-phase-name">{result.phaseName}</h2>
						<p className="mpc-illumination">{result.illumination}% illuminated</p>

						<div className="mpc-cycle-bar-wrap">
							<div className="mpc-cycle-bar-track">
								<div
									className="mpc-cycle-bar-fill"
									style={{ width: `${result.cycleProgress}%` }}
								/>
								<div
									className="mpc-cycle-bar-marker"
									style={{ left: `${result.cycleProgress}%` }}
									aria-hidden="true"
								/>
							</div>
							<div className="mpc-cycle-bar-labels">
								<span>🌑 New</span>
								<span>🌕 Full</span>
								<span>🌑 New</span>
							</div>
						</div>

						<div className="mpc-stats-grid">
							<div className="mpc-stat">
								<span className="mpc-stat-value">
									{formatDays(result.daysUntilFull)}
								</span>
								<span className="mpc-stat-label">Until next full moon</span>
							</div>
							<div className="mpc-stat">
								<span className="mpc-stat-value">
									{formatDays(result.daysUntilNew)}
								</span>
								<span className="mpc-stat-label">Until next new moon</span>
							</div>
							<div className="mpc-stat">
								<span className="mpc-stat-value">
									Day {result.lunarDay} of 29.5
								</span>
								<span className="mpc-stat-label">Lunar cycle day</span>
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
					</div>
				</section>
			)}

			{mode === 'any' && !customDate && (
				<p className="mpc-hint">Enter a date above to see the moon phase.</p>
			)}
		</div>
	);
}
