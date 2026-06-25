import { useEffect, useMemo, useState } from 'react';

const PERIODIC_TERMS = [
	[485, 324.96, 1934.136],
	[203, 337.23, 32964.467],
	[199, 342.08, 20.186],
	[182, 27.85, 445267.112],
	[156, 73.14, 45036.886],
	[136, 171.52, 22518.443],
	[77, 222.54, 65928.934],
	[74, 296.72, 3034.906],
	[70, 243.58, 9037.513],
	[58, 119.81, 33718.147],
	[52, 297.17, 150.0],
	[50, 21.02, 2281.226],
	[45, 247.54, 29929.562],
	[44, 325.15, 31555.956],
	[29, 60.93, 4443.417],
	[18, 155.12, 67555.328],
	[17, 288.79, 4562.452],
	[16, 198.04, 62894.029],
	[14, 199.59, 31436.921],
	[12, 95.39, 14577.848],
	[12, 287.11, 31931.756],
	[12, 320.81, 34777.259],
	[9, 227.73, 1222.114],
	[8, 15.45, 16859.074],
];

/** Meeus Table 27.A — JDE0 and polynomial coefficients per season */
const SEASON_COEFFS = {
	spring: [2451623.80984, 365.24237404, 0.05169, -0.00411, -0.00057],
	summer: [2451716.56767, 365.24162603, 0.00325, 0.00888, -0.0003],
	autumn: [2451810.21715, 365.24201797, -0.01575, 0.00333, -0.00078],
	winter: [2451900.05952, 365.24274049, -0.06223, -0.00823, 0.00032],
};

const SEASONS = [
	{ id: 'spring', label: 'Spring', emoji: '🌱' },
	{ id: 'summer', label: 'Summer', emoji: '☀️' },
	{ id: 'autumn', label: 'Autumn', emoji: '🍂' },
	{ id: 'winter', label: 'Winter', emoji: '❄️' },
];

const FLOAT_EMOJIS = {
	spring: ['🌱', '🌸', '🌦️', '🐝'],
	summer: ['☀️', '🌊', '🏖️', '🍦'],
	autumn: ['🍂', '🍁', '🎃', '🌙'],
	winter: ['❄️', '⛄', '🎄', '🌨️'],
};

const LEFT_FLOAT_LAYOUT = [
	{ size: 48, rotation: -15, top: '10%', side: '2%', delay: 0 },
	{ size: 32, rotation: 12, top: '25%', side: '8%', delay: 0.5 },
	{ size: 40, rotation: -8, top: '45%', side: '4%', delay: 1 },
	{ size: 28, rotation: 15, top: '65%', side: '10%', delay: 1.5 },
];

const RIGHT_FLOAT_LAYOUT = [
	{ size: 36, rotation: -5, top: '15%', side: '3%', delay: 2 },
	{ size: 48, rotation: 14, top: '30%', side: '9%', delay: 2.5 },
	{ size: 30, rotation: -10, top: '50%', side: '5%', delay: 3 },
	{ size: 42, rotation: 6, top: '70%', side: '8%', delay: 3.5 },
];

function julianDayToUTCDate(jd) {
	const jd0 = Math.floor(jd + 0.5);
	const f = jd + 0.5 - jd0;
	let a = jd0;
	if (jd0 >= 2299161) {
		const alpha = Math.floor((jd0 - 1867216.25) / 36524.25);
		a = jd0 + 1 + alpha - Math.floor(alpha / 4);
	}
	const b = a + 1524;
	const c = Math.floor((b - 122.1) / 365.25);
	const d = Math.floor(365.25 * c);
	const e = Math.floor((b - d) / 30.6001);

	const dayFrac = b - d - Math.floor(30.6001 * e) + f;
	const day = Math.floor(dayFrac);
	const dayFraction = dayFrac - day;

	const month = e < 14 ? e - 1 : e - 13;
	const year = month > 2 ? c - 4716 : c - 4715;

	const totalSeconds = dayFraction * 86400;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

/** Astronomical season start (equinox or solstice) in UTC — Jean Meeus, Astronomical Algorithms Ch. 27 */
export function getSeasonStartUTC(year, season) {
	const Y = (year - 2000) / 1000;
	const [j0, a, b, c, d] = SEASON_COEFFS[season];
	let S = 0;
	for (const [A, B, C] of PERIODIC_TERMS) {
		S += A * Math.cos(((B + C * Y) * Math.PI) / 180);
	}
	const jd =
		j0 +
		a * (year - 2000) +
		b * Y * Y +
		c * Y * Y * Y +
		d * Y * Y * Y * Y +
		0.00001 * S;
	return julianDayToUTCDate(jd);
}

export function getNextSeasonOccurrence(season, now = new Date()) {
	const year = now.getUTCFullYear();
	let target = getSeasonStartUTC(year, season);
	if (target.getTime() <= now.getTime()) {
		target = getSeasonStartUTC(year + 1, season);
	}
	return target;
}

export function getNextUpcomingSeason(now = new Date()) {
	const year = now.getUTCFullYear();
	const candidates = [];

	for (const y of [year, year + 1]) {
		for (const season of SEASONS) {
			const date = getSeasonStartUTC(y, season.id);
			if (date.getTime() > now.getTime()) {
				candidates.push({ season: season.id, date });
			}
		}
	}

	candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
	return candidates[0]?.season ?? 'spring';
}

function pad(n) {
	return String(n).padStart(2, '0');
}

function formatSeasonStart(season, date) {
	const name = season.charAt(0).toUpperCase() + season.slice(1);
	const weekday = date.toLocaleDateString('en-GB', {
		weekday: 'long',
		timeZone: 'UTC',
	});
	const dayMonthYear = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});
	const time = `${date.toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC',
		hour12: false,
	})} UTC`;

	return `${name} begins on ${weekday}, ${dayMonthYear} at ${time}`;
}

export default function SeasonCountdown() {
	const [now, setNow] = useState(() => new Date());
	const [selectedSeason, setSelectedSeason] = useState(() =>
		getNextUpcomingSeason(new Date()),
	);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(
		() => getNextSeasonOccurrence(selectedSeason, now),
		[selectedSeason, now],
	);

	const countdown = useMemo(() => {
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) {
			return { days: 0, hours: 0, mins: 0, secs: 0 };
		}
		const totalSeconds = Math.floor(diff / 1000);
		return {
			days: Math.floor(totalSeconds / 86400),
			hours: Math.floor((totalSeconds % 86400) / 3600),
			mins: Math.floor((totalSeconds % 3600) / 60),
			secs: totalSeconds % 60,
		};
	}, [target, now]);

	const floatEmojis = FLOAT_EMOJIS[selectedSeason] ?? FLOAT_EMOJIS.spring;

	return (
		<div className="sc-tool">
			<section className="sc-hero-band" aria-label="Season countdown">
				<div className="sc-hero-decor" aria-hidden="true">
					{LEFT_FLOAT_LAYOUT.map((layout, i) => (
						<span
							key={`left-${floatEmojis[i]}-${layout.delay}`}
							className="sc-float-emoji sc-float-emoji--left"
							style={{
								fontSize: `${layout.size}px`,
								top: layout.top,
								left: layout.side,
								'--rotation': `${layout.rotation}deg`,
								animationDelay: `${layout.delay}s`,
							}}
						>
							{floatEmojis[i]}
						</span>
					))}
					{RIGHT_FLOAT_LAYOUT.map((layout, i) => (
						<span
							key={`right-${floatEmojis[i]}-${layout.delay}`}
							className="sc-float-emoji sc-float-emoji--right"
							style={{
								fontSize: `${layout.size}px`,
								top: layout.top,
								right: layout.side,
								'--rotation': `${layout.rotation}deg`,
								animationDelay: `${layout.delay}s`,
							}}
						>
							{floatEmojis[i]}
						</span>
					))}
				</div>

				<div className="sc-hero-centre">
					<div
						className="sc-season-grid"
						role="radiogroup"
						aria-label="Select a season"
					>
						{SEASONS.map((season) => (
							<button
								key={season.id}
								type="button"
								className={`sc-season-card${selectedSeason === season.id ? ' sc-season-card--active' : ''}`}
								role="radio"
								aria-checked={selectedSeason === season.id}
								onClick={() => setSelectedSeason(season.id)}
							>
								<span className="sc-season-emoji" aria-hidden="true">
									{season.emoji}
								</span>
								<span className="sc-season-label">{season.label}</span>
							</button>
						))}
					</div>

					<div className="sc-countdown" aria-live="polite">
						<div className="sc-countdown-block">
							<span className="sc-countdown-num sc-countdown-num--days">
								{countdown.days}
							</span>
							<span className="sc-countdown-unit">Days</span>
						</div>
						<span className="sc-countdown-sep">:</span>
						<div className="sc-countdown-block">
							<span className="sc-countdown-num">{pad(countdown.hours)}</span>
							<span className="sc-countdown-unit">Hours</span>
						</div>
						<span className="sc-countdown-sep">:</span>
						<div className="sc-countdown-block">
							<span className="sc-countdown-num">{pad(countdown.mins)}</span>
							<span className="sc-countdown-unit">Minutes</span>
						</div>
						<span className="sc-countdown-sep">:</span>
						<div className="sc-countdown-block">
							<span className="sc-countdown-num">{pad(countdown.secs)}</span>
							<span className="sc-countdown-unit">Seconds</span>
						</div>
					</div>

					<p className="sc-target-date">
						{formatSeasonStart(selectedSeason, target)}
					</p>

					<p className="sc-note">
						Seasons are shown using astronomical dates (solstices and equinoxes).
						Meteorological seasons start on fixed calendar dates (1 March, 1 June,
						etc.).
					</p>
				</div>
			</section>
		</div>
	);
}
