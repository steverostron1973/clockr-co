import { useEffect, useMemo, useState } from 'react';

/** Boxing Day — always 26 December */
export function getBoxingDay(year) {
	return new Date(year, 11, 26, 0, 0, 0, 0);
}

export function getTargetBoxingDay(now = new Date()) {
	let year = now.getFullYear();
	let target = getBoxingDay(year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getBoxingDay(year);
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

export default function BoxingDayCountdown() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetBoxingDay(now), [now]);

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
		<div className="bxd-countdown-widget">
			<div className="bxd-countdown" aria-live="polite">
				<div className="bxd-countdown-block">
					<span className="bxd-countdown-num bxd-countdown-num--days">{countdown.days}</span>
					<span className="bxd-countdown-unit">Days</span>
				</div>
				<span className="bxd-countdown-sep">:</span>
				<div className="bxd-countdown-block">
					<span className="bxd-countdown-num">{pad(countdown.hours)}</span>
					<span className="bxd-countdown-unit">Hours</span>
				</div>
				<span className="bxd-countdown-sep">:</span>
				<div className="bxd-countdown-block">
					<span className="bxd-countdown-num">{pad(countdown.mins)}</span>
					<span className="bxd-countdown-unit">Minutes</span>
				</div>
				<span className="bxd-countdown-sep">:</span>
				<div className="bxd-countdown-block">
					<span className="bxd-countdown-num">{pad(countdown.secs)}</span>
					<span className="bxd-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="bxd-target-date">{formatDateLabel(target)}</p>
		</div>
	);
}
