import { useEffect, useMemo, useState } from 'react';

/** St Patrick's Day — always 17 March */
export function getStPatricksDay(year) {
	return new Date(year, 2, 17, 0, 0, 0, 0);
}

export function getTargetStPatricksDay(now = new Date()) {
	let year = now.getFullYear();
	let target = getStPatricksDay(year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getStPatricksDay(year);
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

export default function StPatricksDayCountdown() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetStPatricksDay(now), [now]);

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
		<div className="spd-countdown-widget">
			<div className="spd-countdown" aria-live="polite">
				<div className="spd-countdown-block">
					<span className="spd-countdown-num spd-countdown-num--days">{countdown.days}</span>
					<span className="spd-countdown-unit">Days</span>
				</div>
				<span className="spd-countdown-sep">:</span>
				<div className="spd-countdown-block">
					<span className="spd-countdown-num">{pad(countdown.hours)}</span>
					<span className="spd-countdown-unit">Hours</span>
				</div>
				<span className="spd-countdown-sep">:</span>
				<div className="spd-countdown-block">
					<span className="spd-countdown-num">{pad(countdown.mins)}</span>
					<span className="spd-countdown-unit">Minutes</span>
				</div>
				<span className="spd-countdown-sep">:</span>
				<div className="spd-countdown-block">
					<span className="spd-countdown-num">{pad(countdown.secs)}</span>
					<span className="spd-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="spd-target-date">{formatDateLabel(target)}</p>
		</div>
	);
}
