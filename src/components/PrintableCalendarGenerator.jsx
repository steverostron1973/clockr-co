import { useState } from 'react';
import {
	generateMonthlyPdf,
	generateYearlyPdf,
} from '../utils/printableCalendarPdf';

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const CURRENT_YEAR = new Date().getFullYear();

export default function PrintableCalendarGenerator() {
	const [viewMode, setViewMode] = useState('monthly');
	const [month, setMonth] = useState(new Date().getMonth() + 1);
	const [year, setYear] = useState(CURRENT_YEAR);
	const [style, setStyle] = useState('minimal');
	const [error, setError] = useState('');
	const [generating, setGenerating] = useState(false);

	function clampYear(value) {
		const n = parseInt(String(value), 10);
		if (Number.isNaN(n)) return CURRENT_YEAR;
		return Math.min(9999, Math.max(1000, n));
	}

	async function handleGenerate() {
		setError('');
		setGenerating(true);

		try {
			if (viewMode === 'monthly') {
				generateMonthlyPdf(year, month, style);
			} else {
				generateYearlyPdf(year, style);
			}
		} catch {
			setError('Could not generate the PDF. Please try again.');
		} finally {
			setGenerating(false);
		}
	}

	return (
		<div className="pcg-tool">
			<div className="pcg-card">
				<div className="pcg-toggle" role="group" aria-label="Calendar view">
					<button
						type="button"
						className={`pcg-toggle-btn${viewMode === 'monthly' ? ' pcg-toggle-btn--active' : ''}`}
						aria-pressed={viewMode === 'monthly'}
						onClick={() => setViewMode('monthly')}
					>
						Monthly
					</button>
					<button
						type="button"
						className={`pcg-toggle-btn${viewMode === 'yearly' ? ' pcg-toggle-btn--active' : ''}`}
						aria-pressed={viewMode === 'yearly'}
						onClick={() => setViewMode('yearly')}
					>
						Yearly
					</button>
				</div>

				<div className="pcg-fields">
					{viewMode === 'monthly' && (
						<div className="date-input-wrap-default">
							<label className="date-input-label-default" htmlFor="pcg-month">
								Month
							</label>
							<select
								id="pcg-month"
								className="date-input-default pcg-select"
								value={month}
								onChange={(e) => setMonth(parseInt(e.target.value, 10))}
							>
								{MONTHS.map((name, index) => (
									<option key={name} value={index + 1}>
										{name}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="date-input-wrap-default">
						<label className="date-input-label-default" htmlFor="pcg-year">
							Year
						</label>
						<input
							id="pcg-year"
							type="number"
							className="date-input-default"
							min={1000}
							max={9999}
							value={year}
							onChange={(e) => setYear(clampYear(e.target.value))}
						/>
					</div>
				</div>

				<div className="pcg-style">
					<span className="pcg-style-label">Style</span>
					<div className="pcg-style-options" role="radiogroup" aria-label="Calendar style">
						<label className="pcg-style-option">
							<input
								type="radio"
								name="pcg-style"
								value="minimal"
								checked={style === 'minimal'}
								onChange={() => setStyle('minimal')}
							/>
							<span>Minimal</span>
						</label>
						<label
							className={`pcg-style-option${viewMode === 'yearly' ? ' pcg-style-option--disabled' : ''}`}
						>
							<input
								type="radio"
								name="pcg-style"
								value="notes"
								checked={style === 'notes'}
								disabled={viewMode === 'yearly'}
								onChange={() => setStyle('notes')}
							/>
							<span>With notes lines</span>
						</label>
					</div>
					{viewMode === 'yearly' && (
						<p className="pcg-style-hint">
							Notes lines are available for monthly calendars only.
						</p>
					)}
				</div>

				<button
					type="button"
					className="pcg-generate"
					onClick={handleGenerate}
					disabled={generating}
				>
					{generating ? 'Generating…' : 'Generate PDF'}
				</button>

				{error && <p className="pcg-error">{error}</p>}
			</div>

			<p className="pcg-preview-note">
				PDFs use a clean white layout for printing on A4 paper (US Letter works
				too). Your browser will download the file directly — nothing is sent to a
				server.
			</p>
		</div>
	);
}
