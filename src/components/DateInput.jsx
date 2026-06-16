import { useEffect, useState } from 'react';

export function formatDateMask(raw) {
	const digits = raw.replace(/\D/g, '').slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseDDMMYYYY(str) {
	if (!str || str.length !== 10) return null;
	const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (!match) return null;
	const day = parseInt(match[1], 10);
	const month = parseInt(match[2], 10);
	const year = parseInt(match[3], 10);
	if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
	const d = new Date(year, month - 1, day);
	if (d.getDate() !== day || d.getMonth() !== month - 1 || d.getFullYear() !== year) {
		return null;
	}
	return d;
}

export function dateToDisplay(d) {
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}/${month}/${year}`;
}

export default function DateInput({
	id,
	label,
	value,
	onChange,
	placeholder = 'dd/mm/yyyy',
	inputClassName = '',
	labelClassName = '',
	wrapClassName = '',
	maxDate = null,
}) {
	const [display, setDisplay] = useState(value ?? '');

	useEffect(() => {
		setDisplay(value ?? '');
	}, [value]);

	function handleChange(e) {
		const masked = formatDateMask(e.target.value);
		setDisplay(masked);

		if (masked.length === 10) {
			const parsed = parseDDMMYYYY(masked);
			if (parsed && (!maxDate || parsed.getTime() <= maxDate.getTime())) {
				onChange?.(parsed, masked);
				return;
			}
		}

		if (masked.length === 0) {
			onChange?.(null, '');
		} else {
			onChange?.(null, masked);
		}
	}

	return (
		<div className={wrapClassName}>
			{label && (
				<label className={labelClassName} htmlFor={id}>
					{label}
				</label>
			)}
			<input
				id={id}
				type="text"
				inputMode="numeric"
				className={inputClassName}
				value={display}
				onChange={handleChange}
				placeholder={placeholder}
				autoComplete="off"
				maxLength={10}
				aria-label={label || 'Date'}
			/>
		</div>
	);
}
