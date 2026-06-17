import { useEffect, useMemo, useState } from 'react';
import { getThanksgiving } from './ThanksgivingCountdown.jsx';

/** US Black Friday — day after Thanksgiving (fourth Friday in November) */
export function getBlackFriday(year) {
	const thanksgiving = getThanksgiving(year);
	return new Date(
		thanksgiving.getFullYear(),
		thanksgiving.getMonth(),
		thanksgiving.getDate() + 1,
		0,
		0,
		0,
		0,
	);
}

/** Cyber Monday — Monday after Black Friday */
export function getCyberMonday(blackFriday) {
	return new Date(
		blackFriday.getFullYear(),
		blackFriday.getMonth(),
		blackFriday.getDate() + 3,
		0,
		0,
		0,
		0,
	);
}

export function getTargetBlackFriday(now = new Date()) {
	let year = now.getFullYear();
	let target = getBlackFriday(year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getBlackFriday(year);
	}
	return target;
}

function pad(n) {
	return String(n).padStart(2, '0');
}

function formatDateLabel(date) {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export default function BlackFridayCountdown() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetBlackFriday(now), [now]);
	const cyberMonday = useMemo(() => getCyberMonday(target), [target]);

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

	return (
		<div className="bf-countdown-widget">
			<div className="bf-countdown" aria-live="polite">
				<div className="bf-countdown-block">
					<span className="bf-countdown-num bf-countdown-num--days">{countdown.days}</span>
					<span className="bf-countdown-unit">Days</span>
				</div>
				<span className="bf-countdown-sep">:</span>
				<div className="bf-countdown-block">
					<span className="bf-countdown-num">{pad(countdown.hours)}</span>
					<span className="bf-countdown-unit">Hours</span>
				</div>
				<span className="bf-countdown-sep">:</span>
				<div className="bf-countdown-block">
					<span className="bf-countdown-num">{pad(countdown.mins)}</span>
					<span className="bf-countdown-unit">Minutes</span>
				</div>
				<span className="bf-countdown-sep">:</span>
				<div className="bf-countdown-block">
					<span className="bf-countdown-num">{pad(countdown.secs)}</span>
					<span className="bf-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="bf-target-date">{formatDateLabel(target)}</p>
			<p className="bf-secondary-date">
				Cyber Monday: {formatDateLabel(cyberMonday)}
			</p>
		</div>
	);
}
