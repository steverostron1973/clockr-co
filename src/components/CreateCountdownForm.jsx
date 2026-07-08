import { useState } from 'react';
import { COUNTDOWN_COLOR_PRESETS } from '../data/countdownColors.js';
import DateInput, { dateToDisplay } from './DateInput.jsx';

function toISODate(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export default function CreateCountdownForm() {
	const [name, setName] = useState('');
	const [date, setDate] = useState(null);
	const [dateDisplay, setDateDisplay] = useState('');
	const [color, setColor] = useState(COUNTDOWN_COLOR_PRESETS[0].id);
	const [error, setError] = useState('');

	function handleDateChange(parsed, masked) {
		setDateDisplay(masked);
		setDate(parsed ?? null);
		if (error) setError('');
	}

	function handleSubmit(e) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) {
			setError('Please enter an event name.');
			return;
		}
		if (!date) {
			setError('Please enter a valid target date (dd/mm/yyyy).');
			return;
		}

		const params = new URLSearchParams({
			name: trimmed,
			date: toISODate(date),
			color,
		});
		window.location.assign(`/countdown?${params.toString()}`);
	}

	return (
		<form className="cc-form" onSubmit={handleSubmit} noValidate>
			<div className="cc-form-card">
				<div className="cc-field">
					<label className="cc-label" htmlFor="cc-event-name">
						Event name
					</label>
					<input
						id="cc-event-name"
						type="text"
						className="cc-text-input"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							if (error) setError('');
						}}
						placeholder='e.g. "My Wedding", "Product Launch"'
						autoComplete="off"
						maxLength={80}
					/>
				</div>

				<div className="cc-field cc-field--date">
					<DateInput
						id="cc-target-date"
						label="Target date"
						value={dateDisplay || (date ? dateToDisplay(date) : '')}
						onChange={handleDateChange}
					/>
				</div>

				<div className="cc-field">
					<span className="cc-label" id="cc-color-label">
						Colour theme
					</span>
					<div
						className="cc-swatches"
						role="radiogroup"
						aria-labelledby="cc-color-label"
					>
						{COUNTDOWN_COLOR_PRESETS.map((preset) => {
							const selected = color === preset.id;
							return (
								<button
									key={preset.id}
									type="button"
									role="radio"
									aria-checked={selected}
									aria-label={preset.label}
									className={`cc-swatch${selected ? ' cc-swatch--selected' : ''}`}
									style={{
										background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
									}}
									onClick={() => setColor(preset.id)}
								/>
							);
						})}
					</div>
				</div>

				{error && (
					<p className="cc-error" role="alert">
						{error}
					</p>
				)}

				<button type="submit" className="cc-submit">
					Create Countdown
				</button>
			</div>
		</form>
	);
}
