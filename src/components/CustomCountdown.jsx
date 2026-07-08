import { useEffect, useState } from 'react';
import { COUNTDOWN_COLOR_PRESETS } from '../data/countdownColors.js';

function pad(n) {
	return String(n).padStart(2, '0');
}

function findPreset(colorId) {
	return (
		COUNTDOWN_COLOR_PRESETS.find((p) => p.id === colorId) ??
		COUNTDOWN_COLOR_PRESETS[0]
	);
}

function parseISODate(value) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [year, month, day] = value.split('-').map(Number);
	const d = new Date(year, month - 1, day, 0, 0, 0, 0);
	if (
		d.getFullYear() !== year ||
		d.getMonth() !== month - 1 ||
		d.getDate() !== day
	) {
		return null;
	}
	return d;
}

function parseParams() {
	const params = new URLSearchParams(window.location.search);
	const name = (params.get('name') ?? '').trim();
	const dateRaw = (params.get('date') ?? '').trim();
	const colorRaw = (params.get('color') ?? '').trim();
	const date = parseISODate(dateRaw);
	const knownColor = COUNTDOWN_COLOR_PRESETS.some((p) => p.id === colorRaw);
	const color = knownColor ? colorRaw : COUNTDOWN_COLOR_PRESETS[0].id;

	if (!name || !date) {
		return { valid: false };
	}

	return { valid: true, name, date, color };
}

function getRemaining(target) {
	const now = new Date();
	const diff = target.getTime() - now.getTime();
	if (diff <= 0) {
		return { past: true, days: 0, hours: 0, mins: 0, secs: 0, totalSeconds: 0 };
	}
	const totalSeconds = Math.floor(diff / 1000);
	return {
		past: false,
		days: Math.floor(totalSeconds / 86400),
		hours: Math.floor((totalSeconds % 86400) / 3600),
		mins: Math.floor((totalSeconds % 3600) / 60),
		secs: totalSeconds % 60,
		totalSeconds,
	};
}

export default function CustomCountdown() {
	const [parsed, setParsed] = useState(null);
	const [remaining, setRemaining] = useState(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setParsed(parseParams());
	}, []);

	useEffect(() => {
		if (!parsed?.valid) return undefined;

		function tick() {
			setRemaining(getRemaining(parsed.date));
		}
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [parsed]);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}

	if (parsed === null) {
		return <div className="cc-countdown-loading" aria-hidden="true" />;
	}

	if (!parsed.valid) {
		return (
			<div className="cc-invalid">
				<h1 className="cc-invalid-title">Countdown not found</h1>
				<p className="cc-invalid-text">
					This countdown link is missing a name or date, or the details look
					invalid. Create a new countdown and we&apos;ll give you a shareable link.
				</p>
				<a href="/create-countdown" className="cc-invalid-link">
					Create a countdown
				</a>
			</div>
		);
	}

	const preset = findPreset(parsed.color);
	const gradient = `linear-gradient(135deg, ${preset.from}, ${preset.to})`;
	const dateFormatted = parsed.date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	const weeks = remaining ? Math.floor(remaining.days / 7) : 0;
	const totalHours = remaining
		? Math.floor(remaining.totalSeconds / 3600)
		: 0;

	return (
		<div
			className="cc-countdown-page"
			style={{
				'--cc-from': preset.from,
				'--cc-to': preset.to,
				'--cc-gradient': gradient,
			}}
		>
			<section className="cc-hero" aria-label={`${parsed.name} countdown`}>
				<div className="cc-hero-centre">
					<p className="cc-hero-eyebrow">Countdown to</p>
					<h1 className="cc-hero-title">{parsed.name}</h1>
					<p className="cc-hero-date">{dateFormatted}</p>

					{remaining?.past ? (
						<div className="cc-arrived">
							<p className="cc-arrived-text">It&apos;s here!</p>
						</div>
					) : (
						<div className="cc-timer" id="cc-timer">
							<div className="cc-timer-block">
								<span className="cc-timer-num cc-timer-num--days">
									{remaining ? remaining.days : '0'}
								</span>
								<span className="cc-timer-unit">Days</span>
							</div>
							<span className="cc-timer-sep">:</span>
							<div className="cc-timer-block">
								<span className="cc-timer-num">
									{remaining ? pad(remaining.hours) : '00'}
								</span>
								<span className="cc-timer-unit">Hours</span>
							</div>
							<span className="cc-timer-sep">:</span>
							<div className="cc-timer-block">
								<span className="cc-timer-num">
									{remaining ? pad(remaining.mins) : '00'}
								</span>
								<span className="cc-timer-unit">Minutes</span>
							</div>
							<span className="cc-timer-sep">:</span>
							<div className="cc-timer-block">
								<span className="cc-timer-num">
									{remaining ? pad(remaining.secs) : '00'}
								</span>
								<span className="cc-timer-unit">Seconds</span>
							</div>
						</div>
					)}
				</div>
			</section>

			<div className="cc-body">
				<section className="cc-stats-section">
					<h2 className="cc-stats-heading">{parsed.name} by the numbers</h2>
					<div className="cc-stats-grid">
						<div className="cc-stat-card">
							<div className="cc-stat-label">Exact time remaining</div>
							<div className="cc-stat-value">
								{remaining?.past
									? 'The date has arrived'
									: remaining
										? `${remaining.days} days, ${remaining.hours} hours, ${remaining.mins} minutes, ${remaining.secs} seconds`
										: '—'}
							</div>
						</div>
						<div className="cc-stat-card">
							<div className="cc-stat-label">Target day</div>
							<div className="cc-stat-value">{dateFormatted}</div>
						</div>
						<div className="cc-stat-card">
							<div className="cc-stat-label">Weeks remaining</div>
							<div className="cc-stat-value">
								{remaining?.past
									? '0 weeks'
									: `${weeks} week${weeks === 1 ? '' : 's'}`}
							</div>
						</div>
						<div className="cc-stat-card">
							<div className="cc-stat-label">Hours remaining</div>
							<div className="cc-stat-value">
								{remaining?.past
									? '0 hours'
									: `${totalHours.toLocaleString('en-GB')} hour${totalHours === 1 ? '' : 's'}`}
							</div>
						</div>
					</div>
				</section>

				<button type="button" className="cc-copy-btn" onClick={handleCopy}>
					{copied ? '✓ Copied!' : 'Copy Link'}
				</button>

				<section className="cc-how">
					<h2 className="cc-section-title">How this countdown works</h2>
					<div className="cc-how-card">
						<p>
							This page counts down to {dateFormatted}
							{parsed.name ? ` — ${parsed.name}` : ''}. The timer updates every
							second with the exact days, hours, minutes, and seconds remaining
							until midnight on that date in your local time zone.
						</p>
						<p>
							Share this page by copying the link above. Anyone who opens the
							URL will see the same event name, date, and colour theme — no
							account required.
						</p>
					</div>
				</section>

				<div className="cc-related">
					<h3 className="cc-related-title">You might also like</h3>
					<div className="cc-related-grid">
						<a href="/create-countdown" className="cc-related-card">
							<span className="cc-related-name">Create another countdown</span>
						</a>
						<a href="/days-until-christmas" className="cc-related-card">
							<span className="cc-related-name">Days Until Christmas</span>
						</a>
						<a href="/countdown-timer" className="cc-related-card">
							<span className="cc-related-name">Countdown Timer</span>
						</a>
						<a href="/year-progress" className="cc-related-card">
							<span className="cc-related-name">Year Progress Bar</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
