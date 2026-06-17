import { useMemo, useState } from 'react';

const MULTIPLIER_PRESETS = [
	{ id: '1.5', label: '1.5×', sublabel: 'Time and a half' },
	{ id: '2', label: '2×', sublabel: 'Double time' },
	{ id: 'custom', label: 'Custom', sublabel: 'Your rate' },
];

function sanitizeDecimal(raw) {
	let value = String(raw).replace(/[^\d.]/g, '');
	const parts = value.split('.');
	if (parts.length > 2) {
		value = `${parts[0]}.${parts.slice(1).join('')}`;
	}
	return value;
}

function parseDecimal(raw, fallback = null) {
	if (raw === '' || raw == null) return fallback;
	const n = parseFloat(raw);
	return Number.isNaN(n) ? fallback : n;
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function formatHours(n) {
	if (n % 1 === 0) return String(n);
	return n.toFixed(2).replace(/\.?0+$/, '');
}

function formatMoney(n) {
	return `£${n.toLocaleString('en-GB', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

export default function OvertimeCalculator() {
	const [hourlyRateRaw, setHourlyRateRaw] = useState('');
	const [standardHoursRaw, setStandardHoursRaw] = useState('40');
	const [hoursWorkedRaw, setHoursWorkedRaw] = useState('');
	const [multiplierMode, setMultiplierMode] = useState('1.5');
	const [customMultiplierRaw, setCustomMultiplierRaw] = useState('1.5');

	const hourlyRate = parseDecimal(hourlyRateRaw, 0) ?? 0;
	const standardHours = parseDecimal(standardHoursRaw, 40) ?? 40;
	const hoursWorked = parseDecimal(hoursWorkedRaw, 0) ?? 0;

	const multiplier = useMemo(() => {
		if (multiplierMode === 'custom') {
			return parseDecimal(customMultiplierRaw, 1.5) ?? 1.5;
		}
		return parseFloat(multiplierMode);
	}, [multiplierMode, customMultiplierRaw]);

	const regularHours = Math.min(hoursWorked, standardHours);
	const overtimeHours = Math.max(0, hoursWorked - standardHours);
	const regularPay = regularHours * hourlyRate;
	const overtimePay = overtimeHours * hourlyRate * multiplier;
	const totalPay = regularPay + overtimePay;

	const hasRate = hourlyRateRaw !== '' && hourlyRate > 0;
	const hasHoursWorked = hoursWorkedRaw !== '';
	const showResults = hasHoursWorked;

	const displayPay = (amount) => (hasRate ? formatMoney(amount) : '—');

	const handleRateChange = (e) => {
		setHourlyRateRaw(sanitizeDecimal(e.target.value));
	};

	const handleRateBlur = () => {
		if (hourlyRateRaw === '') return;
		const n = parseDecimal(hourlyRateRaw, 0) ?? 0;
		const clamped = clamp(n, 0, 99999);
		setHourlyRateRaw(clamped.toFixed(2));
	};

	const handleStandardHoursChange = (e) => {
		setStandardHoursRaw(sanitizeDecimal(e.target.value));
	};

	const handleStandardHoursBlur = () => {
		const n = parseDecimal(standardHoursRaw, 40) ?? 40;
		const clamped = clamp(n, 1, 168);
		setStandardHoursRaw(formatHours(clamped));
	};

	const handleHoursWorkedChange = (e) => {
		setHoursWorkedRaw(sanitizeDecimal(e.target.value));
	};

	const handleHoursWorkedBlur = () => {
		if (hoursWorkedRaw === '') return;
		const n = parseDecimal(hoursWorkedRaw, 0) ?? 0;
		const clamped = clamp(n, 0, 168);
		setHoursWorkedRaw(formatHours(clamped));
	};

	const handleCustomMultiplierChange = (e) => {
		setCustomMultiplierRaw(sanitizeDecimal(e.target.value));
	};

	const handleCustomMultiplierBlur = () => {
		const n = parseDecimal(customMultiplierRaw, 1.5) ?? 1.5;
		const clamped = clamp(n, 1, 10);
		setCustomMultiplierRaw(formatHours(clamped));
	};

	return (
		<div className="ot-tool">
			<div className="ot-form-card">
				<div className="ot-inputs">
					<div className="ot-input-wrap">
						<label className="ot-label" htmlFor="ot-hourly-rate">
							Regular hourly rate
						</label>
						<div className="ot-rate-row">
							<span className="ot-currency" aria-hidden="true">
								£
							</span>
							<input
								id="ot-hourly-rate"
								type="text"
								inputMode="decimal"
								className="ot-input ot-input--rate"
								value={hourlyRateRaw}
								onChange={handleRateChange}
								onFocus={(e) => e.target.select()}
								onBlur={handleRateBlur}
								placeholder="0.00"
								autoComplete="off"
							/>
						</div>
						<p className="ot-input-note">
							Shown with £ — works for any currency symbol on your payslip
						</p>
					</div>

					<div className="ot-input-wrap">
						<label className="ot-label" htmlFor="ot-standard-hours">
							Standard hours per week
						</label>
						<input
							id="ot-standard-hours"
							type="text"
							inputMode="numeric"
							className="ot-input"
							value={standardHoursRaw}
							onChange={handleStandardHoursChange}
							onFocus={(e) => e.target.select()}
							onBlur={handleStandardHoursBlur}
							autoComplete="off"
						/>
					</div>

					<div className="ot-input-wrap">
						<label className="ot-label" htmlFor="ot-hours-worked">
							Hours actually worked this week
						</label>
						<input
							id="ot-hours-worked"
							type="text"
							inputMode="decimal"
							className="ot-input"
							value={hoursWorkedRaw}
							onChange={handleHoursWorkedChange}
							onFocus={(e) => e.target.select()}
							onBlur={handleHoursWorkedBlur}
							placeholder="e.g. 45"
							autoComplete="off"
						/>
					</div>
				</div>

				<div className="ot-multiplier-section">
					<span className="ot-label ot-label--block">Overtime multiplier</span>
					<div className="ot-multiplier-btns" role="group" aria-label="Overtime multiplier">
						{MULTIPLIER_PRESETS.map((preset) => (
							<button
								key={preset.id}
								type="button"
								className={`ot-multiplier-btn${
									multiplierMode === preset.id ? ' ot-multiplier-btn--active' : ''
								}`}
								onClick={() => setMultiplierMode(preset.id)}
								aria-pressed={multiplierMode === preset.id}
							>
								<span className="ot-multiplier-btn-label">{preset.label}</span>
								<span className="ot-multiplier-btn-sub">{preset.sublabel}</span>
							</button>
						))}
					</div>

					{multiplierMode === 'custom' && (
						<div className="ot-custom-multiplier">
							<label className="ot-label" htmlFor="ot-custom-multiplier">
								Custom multiplier
							</label>
							<div className="ot-custom-row">
								<input
									id="ot-custom-multiplier"
									type="text"
									inputMode="decimal"
									className="ot-input ot-input--multiplier"
									value={customMultiplierRaw}
									onChange={handleCustomMultiplierChange}
									onFocus={(e) => e.target.select()}
									onBlur={handleCustomMultiplierBlur}
									autoComplete="off"
									aria-describedby="ot-custom-multiplier-hint"
								/>
								<span className="ot-custom-suffix" id="ot-custom-multiplier-hint">
									× hourly rate
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{showResults && (
				<div className="ot-results" aria-live="polite">
					<div className="ot-stats-grid">
						<div className="ot-stat-card">
							<div className="ot-stat-label">Regular hours worked</div>
							<div className="ot-stat-num">{formatHours(regularHours)}</div>
						</div>
						<div className="ot-stat-card">
							<div className="ot-stat-label">Overtime hours worked</div>
							<div className="ot-stat-num">{formatHours(overtimeHours)}</div>
						</div>
						<div className="ot-stat-card">
							<div className="ot-stat-label">Regular pay</div>
							<div className="ot-stat-num">{displayPay(regularPay)}</div>
						</div>
						<div className="ot-stat-card">
							<div className="ot-stat-label">Overtime pay</div>
							<div className="ot-stat-num">{displayPay(overtimePay)}</div>
						</div>
					</div>

					<div className="ot-total-card">
						<div className="ot-total-label">Total pay for the week</div>
						<div className="ot-total-num">{displayPay(totalPay)}</div>
					</div>

					<div className="ot-table-wrap">
						<table className="ot-table">
							<thead>
								<tr>
									<th scope="col">Type</th>
									<th scope="col">Hours</th>
									<th scope="col">Rate</th>
									<th scope="col">Pay</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Regular</td>
									<td>{formatHours(regularHours)}</td>
									<td>{hasRate ? `${formatMoney(hourlyRate)}/hr` : '—'}</td>
									<td>{displayPay(regularPay)}</td>
								</tr>
								<tr>
									<td>Overtime ({formatHours(multiplier)}×)</td>
									<td>{formatHours(overtimeHours)}</td>
									<td>
										{hasRate ? `${formatMoney(hourlyRate * multiplier)}/hr` : '—'}
									</td>
									<td>{displayPay(overtimePay)}</td>
								</tr>
							</tbody>
							<tfoot>
								<tr>
									<td colSpan={3}>Total</td>
									<td>{displayPay(totalPay)}</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
