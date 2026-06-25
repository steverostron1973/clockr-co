import { useMemo, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';

const TERM_PRESETS = [
	{ id: '7', label: '7 days' },
	{ id: '14', label: '14 days' },
	{ id: '30', label: '30 days' },
	{ id: '60', label: '60 days' },
	{ id: '90', label: '90 days' },
	{ id: 'custom', label: 'Custom', sublabel: 'Your terms' },
];

const QUICK_TERMS = [
	{ days: 7, label: '7 days', sublabel: 'Immediate' },
	{ days: 30, label: '30 days', sublabel: 'Standard' },
	{ days: 60, label: '60 days', sublabel: 'Extended' },
	{ days: 90, label: '90 days', sublabel: 'Long term' },
];

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
	const out = new Date(d);
	out.setDate(out.getDate() + n);
	return startOfDay(out);
}

function diffDays(from, to) {
	return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}

function sanitizeInteger(raw) {
	return String(raw).replace(/\D/g, '');
}

function parseInteger(raw, fallback = null) {
	if (raw === '' || raw == null) return fallback;
	const n = parseInt(raw, 10);
	return Number.isNaN(n) ? fallback : n;
}

function formatDateLong(d) {
	return d.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function presetIdForDays(days) {
	const match = TERM_PRESETS.find((p) => p.id !== 'custom' && p.id === String(days));
	return match ? match.id : 'custom';
}

export default function InvoiceDueDateCalculator() {
	const today = useMemo(() => startOfDay(new Date()), []);

	const [invoiceDisplay, setInvoiceDisplay] = useState(() => dateToDisplay(today));
	const [invoiceDate, setInvoiceDate] = useState(today);
	const [termMode, setTermMode] = useState('30');
	const [customTermsRaw, setCustomTermsRaw] = useState('30');

	const paymentDays = useMemo(() => {
		if (termMode === 'custom') {
			return parseInteger(customTermsRaw, 30) ?? 30;
		}
		return parseInt(termMode, 10);
	}, [termMode, customTermsRaw]);

	const result = useMemo(() => {
		if (!invoiceDate) return null;

		const dueDate = addDays(invoiceDate, paymentDays);
		const daysRemaining = diffDays(today, dueDate);

		let status;
		let statusClass;
		if (daysRemaining < 0) {
			status = 'Overdue';
			statusClass = 'idc-status--overdue';
		} else if (daysRemaining <= 7) {
			status = 'Due soon — within 7 days';
			statusClass = 'idc-status--due-soon';
		} else {
			status = 'On time';
			statusClass = 'idc-status--on-time';
		}

		let daysLabel;
		let daysClass = '';
		if (daysRemaining < 0) {
			const overdue = Math.abs(daysRemaining);
			daysLabel = `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
			daysClass = 'idc-days--overdue';
		} else if (daysRemaining === 0) {
			daysLabel = 'Due today';
		} else {
			daysLabel = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`;
		}

		return {
			dueDate,
			dueDateFormatted: formatDateLong(dueDate),
			daysRemaining,
			daysLabel,
			daysClass,
			status,
			statusClass,
		};
	}, [invoiceDate, paymentDays, today]);

	function handleInvoiceChange(parsed, masked) {
		setInvoiceDisplay(masked);
		setInvoiceDate(parsed ? startOfDay(parsed) : null);
	}

	function handleCustomTermsChange(e) {
		setCustomTermsRaw(sanitizeInteger(e.target.value));
	}

	function handleCustomTermsBlur() {
		if (customTermsRaw === '') return;
		const n = parseInteger(customTermsRaw, 30) ?? 30;
		setCustomTermsRaw(String(clamp(n, 1, 999)));
	}

	function setPaymentDays(days) {
		const preset = presetIdForDays(days);
		if (preset === 'custom') {
			setTermMode('custom');
			setCustomTermsRaw(String(days));
		} else {
			setTermMode(preset);
		}
	}

	return (
		<div className="idc-tool">
			<div className="idc-form-card">
				<div className="idc-inputs">
					<DateInput
						id="idc-invoice-date"
						label="Invoice date"
						value={invoiceDisplay}
						onChange={handleInvoiceChange}
					/>

					<div className="idc-terms-section">
						<span className="idc-label idc-label--block">Payment terms</span>
						<div className="idc-terms-btns" role="group" aria-label="Payment terms">
							{TERM_PRESETS.map((preset) => (
								<button
									key={preset.id}
									type="button"
									className={`idc-terms-btn${
										termMode === preset.id ? ' idc-terms-btn--active' : ''
									}`}
									onClick={() => setTermMode(preset.id)}
									aria-pressed={termMode === preset.id}
								>
									<span className="idc-terms-btn-label">{preset.label}</span>
									{preset.sublabel && (
										<span className="idc-terms-btn-sub">{preset.sublabel}</span>
									)}
								</button>
							))}
						</div>

						{termMode === 'custom' && (
							<div className="idc-custom-terms">
								<label className="idc-label" htmlFor="idc-custom-terms">
									Custom payment terms
								</label>
								<div className="idc-custom-row">
									<input
										id="idc-custom-terms"
										type="text"
										inputMode="numeric"
										className="idc-input idc-input--terms"
										value={customTermsRaw}
										onChange={handleCustomTermsChange}
										onFocus={(e) => e.target.select()}
										onBlur={handleCustomTermsBlur}
										autoComplete="off"
										aria-describedby="idc-custom-terms-hint"
									/>
									<span className="idc-custom-suffix" id="idc-custom-terms-hint">
										days from invoice date
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{result && (
				<div className="idc-results" aria-live="polite">
					<div className="idc-due-card">
						<div className="idc-due-label">Due</div>
						<div className="idc-due-date">{result.dueDateFormatted}</div>
						<div className={`idc-days${result.daysClass ? ` ${result.daysClass}` : ''}`}>
							{result.daysLabel}
						</div>
						<div className={`idc-status ${result.statusClass}`}>{result.status}</div>
					</div>
				</div>
			)}

			<section className="idc-quick" aria-label="Common payment terms">
				<h2 className="idc-quick-title">Common payment terms</h2>
				<div className="idc-quick-grid">
					{QUICK_TERMS.map((term) => (
						<button
							key={term.days}
							type="button"
							className="idc-quick-btn"
							onClick={() => setPaymentDays(term.days)}
						>
							<span className="idc-quick-btn-label">{term.label}</span>
							<span className="idc-quick-btn-sub">{term.sublabel}</span>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
