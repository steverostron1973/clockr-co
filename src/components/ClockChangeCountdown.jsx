import { useEffect, useMemo, useState } from 'react';

const REGIONS = [
	{ id: 'UK', label: 'UK' },
	{ id: 'US', label: 'US' },
	{ id: 'EU', label: 'EU' },
];

const FLOAT_EMOJIS = ['🕐', '⏰', '🌞', '🌙'];

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

/** Last Sunday of a calendar month (month 0 = January). */
export function getLastSunday(year, month) {
	const lastDay = new Date(year, month + 1, 0);
	const date = lastDay.getDate() - lastDay.getDay();
	return new Date(year, month, date);
}

/** Nth Sunday of a calendar month (n = 1 for first, 2 for second, etc.). */
export function getNthSunday(year, month, n) {
	const first = new Date(year, month, 1);
	const offset = first.getDay() === 0 ? 0 : 7 - first.getDay();
	const day = 1 + offset + (n - 1) * 7;
	return new Date(year, month, day);
}

function getChangeInstant(region, year, direction) {
	if (region === 'US') {
		if (direction === 'forward') {
			const d = getNthSunday(year, 2, 2);
			// 2:00am local (still EST, UTC−5)
			return new Date(
				Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0),
			);
		}
		const d = getNthSunday(year, 10, 1);
		// 2:00am local (still EDT, UTC−4)
		return new Date(
			Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0),
		);
	}

	// UK and EU share the same calendar dates (last Sunday March / October)
	if (direction === 'forward') {
		const d = getLastSunday(year, 2);
		// 1:00am GMT / 1:00 UTC
		return new Date(
			Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0),
		);
	}
	const d = getLastSunday(year, 9);
	// 1:00 UTC (2:00am BST in the UK)
	return new Date(
		Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 1, 0, 0),
	);
}

export function getClockChangesForYear(region, year) {
	const forwardDate =
		region === 'US' ? getNthSunday(year, 2, 2) : getLastSunday(year, 2);
	const backDate =
		region === 'US' ? getNthSunday(year, 10, 1) : getLastSunday(year, 9);

	return [
		{
			direction: 'forward',
			date: forwardDate,
			instant: getChangeInstant(region, year, 'forward'),
		},
		{
			direction: 'back',
			date: backDate,
			instant: getChangeInstant(region, year, 'back'),
		},
	].sort((a, b) => a.instant.getTime() - b.instant.getTime());
}

export function getUpcomingClockChanges(region, now = new Date()) {
	const year = now.getFullYear();
	const candidates = [];

	for (const y of [year, year + 1, year + 2]) {
		for (const change of getClockChangesForYear(region, y)) {
			if (change.instant.getTime() > now.getTime()) {
				candidates.push(change);
			}
		}
	}

	candidates.sort((a, b) => a.instant.getTime() - b.instant.getTime());
	return {
		next: candidates[0] ?? null,
		following: candidates[1] ?? null,
	};
}

function pad(n) {
	return String(n).padStart(2, '0');
}

function formatChangeDate(date) {
	const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
	const dayMonthYear = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${weekday}, ${dayMonthYear}`;
}

function getDirectionLabel(direction) {
	return direction === 'forward' ? 'Clocks go FORWARD' : 'Clocks go BACK';
}

function getExplainerLine(region, direction) {
	if (region === 'US') {
		return direction === 'forward'
			? 'On this date, clocks move forward 1 hour at 2:00am'
			: 'On this date, clocks move back 1 hour at 2:00am';
	}
	if (region === 'EU') {
		return direction === 'forward'
			? 'On this date, clocks move forward 1 hour at 1:00am UTC'
			: 'On this date, clocks move back 1 hour at 1:00am UTC';
	}
	return direction === 'forward'
		? 'On this date, clocks move forward 1 hour at 1:00am'
		: 'On this date, clocks move back 1 hour at 2:00am';
}

function getFollowingLine(region, change) {
	const label = change.direction === 'forward' ? 'forward' : 'back';
	const regionLabel = region === 'US' ? 'US' : region === 'EU' ? 'EU' : 'UK';
	return `Then clocks go ${label} on ${formatChangeDate(change.date)} (${regionLabel})`;
}

export default function ClockChangeCountdown() {
	const [now, setNow] = useState(() => new Date());
	const [region, setRegion] = useState('UK');

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const { next, following } = useMemo(
		() => getUpcomingClockChanges(region, now),
		[region, now],
	);

	const countdown = useMemo(() => {
		if (!next) {
			return { days: 0, hours: 0, mins: 0, secs: 0 };
		}
		const diff = next.instant.getTime() - now.getTime();
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
	}, [next, now]);

	if (!next) {
		return null;
	}

	const directionClass =
		next.direction === 'forward'
			? 'ccc-direction ccc-direction--forward'
			: 'ccc-direction ccc-direction--back';

	return (
		<div className="sc-tool">
			<section className="sc-hero-band" aria-label="Clock change countdown">
				<div className="sc-hero-decor" aria-hidden="true">
					{LEFT_FLOAT_LAYOUT.map((layout, i) => (
						<span
							key={`left-${FLOAT_EMOJIS[i]}-${layout.delay}`}
							className="sc-float-emoji sc-float-emoji--left"
							style={{
								fontSize: `${layout.size}px`,
								top: layout.top,
								left: layout.side,
								'--rotation': `${layout.rotation}deg`,
								animationDelay: `${layout.delay}s`,
							}}
						>
							{FLOAT_EMOJIS[i]}
						</span>
					))}
					{RIGHT_FLOAT_LAYOUT.map((layout, i) => (
						<span
							key={`right-${FLOAT_EMOJIS[i]}-${layout.delay}`}
							className="sc-float-emoji sc-float-emoji--right"
							style={{
								fontSize: `${layout.size}px`,
								top: layout.top,
								right: layout.side,
								'--rotation': `${layout.rotation}deg`,
								animationDelay: `${layout.delay}s`,
							}}
						>
							{FLOAT_EMOJIS[i]}
						</span>
					))}
				</div>

				<div className="sc-hero-centre">
					<div className="ccc-region-wrap">
						<span className="ccc-region-label">Region</span>
						<div
							className="ccc-region-toggle"
							role="group"
							aria-label="Clock change region"
						>
							{REGIONS.map((r) => (
								<button
									key={r.id}
									type="button"
									className={`ccc-region-btn${region === r.id ? ' ccc-region-btn--active' : ''}`}
									aria-pressed={region === r.id}
									onClick={() => setRegion(r.id)}
								>
									{r.label}
								</button>
							))}
						</div>
					</div>

					<p className={directionClass}>{getDirectionLabel(next.direction)}</p>

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

					<p className="sc-target-date">{formatChangeDate(next.date)}</p>

					{following && (
						<p className="ccc-following">{getFollowingLine(region, following)}</p>
					)}

					<p className="sc-note">{getExplainerLine(region, next.direction)}</p>
				</div>
			</section>
		</div>
	);
}
