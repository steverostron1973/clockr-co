import { useEffect, useMemo, useState } from 'react';

/** Father's Day — third Sunday in June (UK, US, and most countries) */
export function getFathersDay(year) {
	const june1 = new Date(year, 5, 1);
	const day = june1.getDay();
	const firstSunday = 1 + ((7 - day) % 7);
	const thirdSunday = firstSunday + 14;
	return new Date(year, 5, thirdSunday, 0, 0, 0, 0);
}

export function getTargetFathersDay(now = new Date()) {
	let year = now.getFullYear();
	let target = getFathersDay(year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getFathersDay(year);
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

export default function FathersDayCountdown() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetFathersDay(now), [now]);

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
		<div className="fd-countdown-widget">
			<div className="fd-countdown" aria-live="polite">
				<div className="fd-countdown-block">
					<span className="fd-countdown-num fd-countdown-num--days">{countdown.days}</span>
					<span className="fd-countdown-unit">Days</span>
				</div>
				<span className="fd-countdown-sep">:</span>
				<div className="fd-countdown-block">
					<span className="fd-countdown-num">{pad(countdown.hours)}</span>
					<span className="fd-countdown-unit">Hours</span>
				</div>
				<span className="fd-countdown-sep">:</span>
				<div className="fd-countdown-block">
					<span className="fd-countdown-num">{pad(countdown.mins)}</span>
					<span className="fd-countdown-unit">Minutes</span>
				</div>
				<span className="fd-countdown-sep">:</span>
				<div className="fd-countdown-block">
					<span className="fd-countdown-num">{pad(countdown.secs)}</span>
					<span className="fd-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="fd-target-date">{formatDateLabel(target)}</p>
		</div>
	);
}
