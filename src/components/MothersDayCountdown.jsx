import { useEffect, useMemo, useState } from 'react';

/** Anonymous Gregorian algorithm for Western Easter Sunday */
export function getEasterDate(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/** UK Mothering Sunday — fourth Sunday of Lent, three weeks before Easter */
export function getUkMothersDay(year) {
	const easter = getEasterDate(year);
	const d = new Date(easter);
	d.setDate(d.getDate() - 21);
	return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** US Mother's Day — second Sunday in May */
export function getUsMothersDay(year) {
	const may1 = new Date(year, 4, 1);
	const day = may1.getDay();
	const firstSunday = 1 + ((7 - day) % 7);
	const secondSunday = firstSunday + 7;
	return new Date(year, 4, secondSunday, 0, 0, 0, 0);
}

export function getMothersDayForYear(region, year) {
	return region === 'UK' ? getUkMothersDay(year) : getUsMothersDay(year);
}

export function getTargetMothersDay(region, now = new Date()) {
	let year = now.getFullYear();
	let target = getMothersDayForYear(region, year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getMothersDayForYear(region, year);
	}
	return target;
}

function pad(n) {
	return String(n).padStart(2, '0');
}

function formatDateLabel(region, date) {
	const formatted = date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	return `${region}: ${formatted}`;
}

function updateExternalStats(region, target, diff) {
	const totalSeconds = Math.floor(diff / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const mins = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const weeks = Math.floor(days / 7);
	const weekday = target.toLocaleDateString('en-GB', { weekday: 'long' });
	const year = target.getFullYear();
	const regionLabel = region === 'UK' ? 'Mothering Sunday' : "Mother's Day";

	const statExact = document.getElementById('stat-exact');
	const statWeekday = document.getElementById('stat-weekday');
	const statWeeks = document.getElementById('stat-weeks');
	const statMinutes = document.getElementById('stat-minutes');

	if (statExact)
		statExact.textContent = `${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds`;
	if (statWeekday)
		statWeekday.textContent = `${regionLabel} ${year} falls on a ${weekday}`;
	if (statWeeks) statWeeks.textContent = `${weeks} week${weeks === 1 ? '' : 's'}`;
	if (statMinutes)
		statMinutes.textContent = `${totalMinutes.toLocaleString()} minute${totalMinutes === 1 ? '' : 's'}`;

	const shareBtn = document.getElementById('md-share-btn');
	if (shareBtn) {
		shareBtn.dataset.days = String(days);
		shareBtn.dataset.region = region;
		shareBtn.dataset.year = String(year);
	}
}

export default function MothersDayCountdown() {
	const [region, setRegion] = useState('UK');
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetMothersDay(region, now), [region, now]);

	const countdown = useMemo(() => {
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) {
			return { days: 0, hours: 0, mins: 0, secs: 0, diff: 0 };
		}
		const totalSeconds = Math.floor(diff / 1000);
		return {
			days: Math.floor(totalSeconds / 86400),
			hours: Math.floor((totalSeconds % 86400) / 3600),
			mins: Math.floor((totalSeconds % 3600) / 60),
			secs: totalSeconds % 60,
			diff,
		};
	}, [target, now]);

	useEffect(() => {
		updateExternalStats(region, target, countdown.diff);
	}, [region, target, countdown.diff]);

	return (
		<div className="md-countdown-widget">
			<div className="md-region-wrap">
				<span className="md-region-label">Region</span>
				<div className="md-region-toggle" role="group" aria-label="Mother's Day region">
					<button
						type="button"
						className={`md-region-btn${region === 'UK' ? ' md-region-btn--active' : ''}`}
						onClick={() => setRegion('UK')}
						aria-pressed={region === 'UK'}
					>
						UK
					</button>
					<button
						type="button"
						className={`md-region-btn${region === 'US' ? ' md-region-btn--active' : ''}`}
						onClick={() => setRegion('US')}
						aria-pressed={region === 'US'}
					>
						US
					</button>
				</div>
			</div>

			<div className="md-countdown" aria-live="polite">
				<div className="md-countdown-block">
					<span className="md-countdown-num md-countdown-num--days">{countdown.days}</span>
					<span className="md-countdown-unit">Days</span>
				</div>
				<span className="md-countdown-sep">:</span>
				<div className="md-countdown-block">
					<span className="md-countdown-num">{pad(countdown.hours)}</span>
					<span className="md-countdown-unit">Hours</span>
				</div>
				<span className="md-countdown-sep">:</span>
				<div className="md-countdown-block">
					<span className="md-countdown-num">{pad(countdown.mins)}</span>
					<span className="md-countdown-unit">Minutes</span>
				</div>
				<span className="md-countdown-sep">:</span>
				<div className="md-countdown-block">
					<span className="md-countdown-num">{pad(countdown.secs)}</span>
					<span className="md-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="md-target-date" id="md-target-date">
				{formatDateLabel(region, target)}
			</p>
		</div>
	);
}
