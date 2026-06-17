import { useEffect, useMemo, useState } from 'react';

const TERM_PRESETS = [
	{
		label: 'Early September',
		sublabel: 'UK typical',
		month: 9,
		day: 1,
	},
	{
		label: 'Late August',
		sublabel: 'US typical (varies by state/district)',
		month: 8,
		day: 26,
	},
	{
		label: 'Early September',
		sublabel: 'Australia Term 3 approx.',
		month: 9,
		day: 2,
	},
];

function parseInputValue(value) {
	if (!value) return null;
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return null;
	const d = new Date(year, month - 1, day);
	if (Number.isNaN(d.getTime())) return null;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toInputValue(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function getNextTermDate(month, day, now = new Date()) {
	let year = now.getFullYear();
	let target = new Date(year, month - 1, day, 0, 0, 0, 0);
	if (now.getTime() >= target.getTime()) {
		year += 1;
		target = new Date(year, month - 1, day, 0, 0, 0, 0);
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

export default function BackToSchoolCountdown() {
	const [now, setNow] = useState(() => new Date());
	const [dateValue, setDateValue] = useState('');

	const schoolDate = useMemo(() => parseInputValue(dateValue), [dateValue]);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const target = useMemo(() => {
		if (!schoolDate) return null;
		return new Date(
			schoolDate.getFullYear(),
			schoolDate.getMonth(),
			schoolDate.getDate(),
			0,
			0,
			0,
			0,
		);
	}, [schoolDate]);

	const isPast = target ? target.getTime() <= now.getTime() : false;

	const countdown = useMemo(() => {
		if (!target || isPast) {
			return { days: 0, hours: 0, mins: 0, secs: 0 };
		}
		const diff = target.getTime() - now.getTime();
		const totalSeconds = Math.floor(diff / 1000);
		return {
			days: Math.floor(totalSeconds / 86400),
			hours: Math.floor((totalSeconds % 86400) / 3600),
			mins: Math.floor((totalSeconds % 3600) / 60),
			secs: totalSeconds % 60,
		};
	}, [target, now, isPast]);

	function applyPreset(month, day) {
		const next = getNextTermDate(month, day, now);
		setDateValue(toInputValue(next));
	}

	return (
		<div className="bts-countdown-widget">
			<div className="bts-input-section">
				<style>{`
					#bts-date-input {
						text-align: center;
					}
					#bts-date-input::-webkit-datetime-edit,
					#bts-date-input::-webkit-datetime-edit-fields-wrapper {
						display: flex;
						justify-content: center;
						width: 100%;
						text-align: center;
					}
					#bts-date-input::-webkit-datetime-edit-day-field,
					#bts-date-input::-webkit-datetime-edit-month-field,
					#bts-date-input::-webkit-datetime-edit-year-field {
						text-align: center;
					}
				`}</style>
				<div className="bts-input-wrap">
					<label className="bts-input-label" htmlFor="bts-date-input">
						When does school start?
					</label>
					<input
						id="bts-date-input"
						type="date"
						className="bts-input"
						value={dateValue}
						onChange={(e) => setDateValue(e.target.value)}
					/>
				</div>
				<p className="bts-input-note">
					Back to school dates vary by country, region, and even individual school
					— enter your own start date below to get an accurate countdown.
				</p>
			</div>

			{target && (
				<div className="bts-results" aria-live="polite">
					{isPast ? (
						<p className="bts-past-message">
							That date has already passed — school started on{' '}
							<strong>{formatDateLabel(target)}</strong>.
						</p>
					) : (
						<div className="bts-countdown">
							<div className="bts-countdown-block">
								<span className="bts-countdown-num bts-countdown-num--days">
									{countdown.days}
								</span>
								<span className="bts-countdown-unit">Days</span>
							</div>
							<span className="bts-countdown-sep">:</span>
							<div className="bts-countdown-block">
								<span className="bts-countdown-num">{pad(countdown.hours)}</span>
								<span className="bts-countdown-unit">Hours</span>
							</div>
							<span className="bts-countdown-sep">:</span>
							<div className="bts-countdown-block">
								<span className="bts-countdown-num">{pad(countdown.mins)}</span>
								<span className="bts-countdown-unit">Minutes</span>
							</div>
							<span className="bts-countdown-sep">:</span>
							<div className="bts-countdown-block">
								<span className="bts-countdown-num">{pad(countdown.secs)}</span>
								<span className="bts-countdown-unit">Seconds</span>
							</div>
						</div>
					)}

					<p className="bts-target-date">{formatDateLabel(target)}</p>
				</div>
			)}

			<section className="bts-presets" aria-label="Common term start dates">
				<h2 className="bts-presets-title">Common term start dates</h2>
				<p className="bts-presets-note">
					These are typical examples only — dates vary widely by school. Check your
					own school&apos;s calendar for the exact start date.
				</p>
				<div className="bts-presets-grid">
					{TERM_PRESETS.map((preset) => (
						<button
							key={`${preset.month}-${preset.day}-${preset.sublabel}`}
							type="button"
							className="bts-preset"
							onClick={() => applyPreset(preset.month, preset.day)}
						>
							<span className="bts-preset-label">{preset.label}</span>
							<span className="bts-preset-sublabel">{preset.sublabel}</span>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
