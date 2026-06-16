import { useEffect, useMemo, useState } from 'react';

/** US Thanksgiving — fourth Thursday in November */
export function getThanksgiving(year) {
	const nov1 = new Date(year, 10, 1);
	const day = nov1.getDay();
	const firstThursday = 1 + ((4 - day + 7) % 7);
	const fourthThursday = firstThursday + 21;
	return new Date(year, 10, fourthThursday, 0, 0, 0, 0);
}

export function getTargetThanksgiving(now = new Date()) {
	let year = now.getFullYear();
	let target = getThanksgiving(year);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = getThanksgiving(year);
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

export default function ThanksgivingCountdown() {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => getTargetThanksgiving(now), [now]);

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
		<div className="tg-countdown-widget">
			<div className="tg-countdown" aria-live="polite">
				<div className="tg-countdown-block">
					<span className="tg-countdown-num tg-countdown-num--days">{countdown.days}</span>
					<span className="tg-countdown-unit">Days</span>
				</div>
				<span className="tg-countdown-sep">:</span>
				<div className="tg-countdown-block">
					<span className="tg-countdown-num">{pad(countdown.hours)}</span>
					<span className="tg-countdown-unit">Hours</span>
				</div>
				<span className="tg-countdown-sep">:</span>
				<div className="tg-countdown-block">
					<span className="tg-countdown-num">{pad(countdown.mins)}</span>
					<span className="tg-countdown-unit">Minutes</span>
				</div>
				<span className="tg-countdown-sep">:</span>
				<div className="tg-countdown-block">
					<span className="tg-countdown-num">{pad(countdown.secs)}</span>
					<span className="tg-countdown-unit">Seconds</span>
				</div>
			</div>

			<p className="tg-target-date">{formatDateLabel(target)}</p>
		</div>
	);
}
