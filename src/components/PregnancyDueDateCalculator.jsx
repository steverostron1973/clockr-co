import { useMemo, useState } from 'react';

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, days) {
	const out = new Date(d);
	out.setDate(out.getDate() + days);
	return out;
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function toInputValue(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function parseInputValue(value) {
	if (!value) return null;
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return null;
	const d = new Date(year, month - 1, day);
	if (Number.isNaN(d.getTime())) return null;
	return startOfDay(d);
}

function formatDateLong(d) {
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}

function getTrimester(weeks) {
	if (weeks < 13) return '1st trimester';
	if (weeks < 27) return '2nd trimester';
	return '3rd trimester';
}

function getMethodLabel(method) {
	if (method === 'lmp') return 'First day of last period';
	if (method === 'conception') return 'Conception date';
	return 'IVF transfer date';
}

function getInputLabel(method) {
	if (method === 'lmp') return 'First day of your last period';
	if (method === 'conception') return 'Your conception date';
	return 'Your IVF transfer date';
}

function computeDates(method, baseDate) {
	// Due date rules per brief:
	// - LMP: +280 days
	// - Conception: +266 days
	// - IVF transfer (5-day): +261 days
	//
	// For week/day progress we show gestational age (weeks pregnant),
	// which is traditionally counted from LMP. When using conception or
	// IVF transfer, we convert to an LMP-equivalent start.
	if (!baseDate) return null;

	if (method === 'lmp') {
		const lmp = baseDate;
		return {
			lmp,
			dueDate: addDays(lmp, 280),
		};
	}

	if (method === 'conception') {
		const conception = baseDate;
		const lmp = addDays(conception, -14);
		return {
			lmp,
			dueDate: addDays(conception, 266),
		};
	}

	// IVF transfer (assume 5-day blastocyst transfer)
	const transfer = baseDate;
	// transfer corresponds to conception + 5 days; LMP is ~14 days before conception.
	const lmp = addDays(transfer, -19);
	return {
		lmp,
		dueDate: addDays(transfer, 261),
	};
}

export default function PregnancyDueDateCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [method, setMethod] = useState('lmp');

	// Reasonable default placeholders:
	// - LMP: about 4 weeks ago
	// - Conception: about 2 weeks ago
	// - Transfer: about 9 days ago (5-day transfer + a few days)
	const defaultDateValue = useMemo(() => {
		if (method === 'lmp') return toInputValue(addDays(today, -28));
		if (method === 'conception') return toInputValue(addDays(today, -14));
		return toInputValue(addDays(today, -9));
	}, [method, today]);

	const [dateValue, setDateValue] = useState(() => toInputValue(addDays(today, -28)));

	// Keep the input value aligned when switching method (warm UX, fewer empty states).
	function handleMethodChange(next) {
		setMethod(next);
		setDateValue(() => {
			if (next === 'lmp') return toInputValue(addDays(today, -28));
			if (next === 'conception') return toInputValue(addDays(today, -14));
			return toInputValue(addDays(today, -9));
		});
	}

	const baseDate = useMemo(() => parseInputValue(dateValue), [dateValue]);
	const computed = useMemo(
		() => computeDates(method, baseDate),
		[method, baseDate],
	);

	const result = useMemo(() => {
		if (!computed) return null;

		const { lmp, dueDate } = computed;
		const daysPregnantRaw = diffDays(lmp, today);
		const daysPregnant = clamp(daysPregnantRaw, 0, 280);
		const weeks = Math.floor(daysPregnant / 7);
		const days = daysPregnant % 7;

		const remainingRaw = diffDays(today, dueDate);
		const daysRemaining = Math.max(0, remainingRaw);

		const progressPct = clamp((daysPregnant / 280) * 100, 0, 100);

		return {
			dueDate,
			weeks,
			days,
			trimester: getTrimester(weeks),
			daysRemaining,
			progressPct,
			isPastDue: remainingRaw < 0,
		};
	}, [computed, today]);

	return (
		<div className="pddc-tool">
			<div className="pddc-card">
				<div className="pddc-card-header">
					<div className="pddc-card-title">Choose a method</div>
					<div className="pddc-card-subtitle">
						Pick the option that best matches the date you know.
					</div>
				</div>

				<div className="pddc-methods" role="tablist" aria-label="Calculation method">
					<button
						type="button"
						className={`pddc-method ${method === 'lmp' ? 'is-active' : ''}`}
						onClick={() => handleMethodChange('lmp')}
						role="tab"
						aria-selected={method === 'lmp'}
					>
						{getMethodLabel('lmp')}
					</button>
					<button
						type="button"
						className={`pddc-method ${method === 'conception' ? 'is-active' : ''}`}
						onClick={() => handleMethodChange('conception')}
						role="tab"
						aria-selected={method === 'conception'}
					>
						{getMethodLabel('conception')}
					</button>
					<button
						type="button"
						className={`pddc-method ${method === 'ivf' ? 'is-active' : ''}`}
						onClick={() => handleMethodChange('ivf')}
						role="tab"
						aria-selected={method === 'ivf'}
					>
						{getMethodLabel('ivf')}
					</button>
				</div>

				<div className="pddc-input-row">
					<div className="pddc-input-wrap">
						<label className="pddc-label" htmlFor="pddc-date-input">
							{getInputLabel(method)}
						</label>
						<input
							id="pddc-date-input"
							type="date"
							className="pddc-input"
							value={dateValue}
							onChange={(e) => setDateValue(e.target.value)}
							max={toInputValue(today)}
							aria-describedby={method === 'ivf' ? 'pddc-ivf-note' : undefined}
						/>
						{method === 'ivf' && (
							<p className="pddc-note" id="pddc-ivf-note">
								IVF timing can vary by clinic and transfer day. This calculator uses a
								common estimate for a 5-day blastocyst transfer — always confirm dates
								with your clinic.
							</p>
						)}
					</div>
				</div>
			</div>

			{result && (
				<div className="pddc-results" aria-live="polite">
					<div className="pddc-main">
						<div className="pddc-main-kicker">Estimated due date</div>
						<div className="pddc-main-date">{formatDateLong(result.dueDate)}</div>
						<div className="pddc-main-sub">
							You are currently{' '}
							<strong>
								{result.weeks} weeks and {result.days} days
							</strong>{' '}
							pregnant.
						</div>
					</div>

					<div className="pddc-stats">
						<div className="pddc-stat">
							<div className="pddc-stat-num">{result.trimester}</div>
							<div className="pddc-stat-label">Trimester</div>
						</div>
						<div className="pddc-stat">
							<div className="pddc-stat-num">
								{result.isPastDue ? '0' : result.daysRemaining.toLocaleString('en-GB')}
							</div>
							<div className="pddc-stat-label">Days remaining</div>
						</div>
						<div className="pddc-stat">
							<div className="pddc-stat-num">
								{Math.round(result.progressPct).toLocaleString('en-GB')}%
							</div>
							<div className="pddc-stat-label">Pregnancy progress</div>
						</div>
					</div>

					<div className="pddc-progress">
						<div className="pddc-progress-top">
							<span>Week {clamp(result.weeks, 0, 40)}</span>
							<span>40 weeks</span>
						</div>
						<div className="pddc-progress-track" aria-hidden="true">
							<div
								className="pddc-progress-fill"
								style={{ width: `${result.progressPct}%` }}
							/>
						</div>
					</div>

					<div className="pddc-disclaimer" role="note">
						This is an estimate based on average pregnancy length. Only about 5% of
						babies are born on their exact due date. Always follow guidance from your
						midwife or doctor for accurate dates and care.
					</div>
				</div>
			)}
		</div>
	);
}

