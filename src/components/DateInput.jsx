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

function digitCount(masked) {
	return masked.replace(/\D/g, '').length;
}

function placeCaretForDigits(input, digitTotal) {
	let pos;
	if (digitTotal <= 2) {
		pos = digitTotal;
	} else if (digitTotal <= 4) {
		pos = 3 + (digitTotal - 2);
	} else {
		pos = 6 + (digitTotal - 4);
	}
	requestAnimationFrame(() => input.setSelectionRange(pos, pos));
}

function selectSegment(input, start) {
	const end = start === 6 ? 10 : start + 2;
	requestAnimationFrame(() => input.setSelectionRange(start, end));
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

	function notifyChange(masked) {
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

	function handleChange(e) {
		const input = e.target;
		const prevDigits = digitCount(display);
		const masked = formatDateMask(input.value);
		const newDigits = digitCount(masked);
		setDisplay(masked);
		notifyChange(masked);

		if (newDigits === 2 && prevDigits < 2) {
			selectSegment(input, 3);
		} else if (newDigits === 4 && prevDigits < 4) {
			selectSegment(input, 6);
		} else {
			placeCaretForDigits(input, newDigits);
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
				onFocus={(e) => {
					e.target.setSelectionRange(0, 0);
				}}
				placeholder={placeholder}
				autoComplete="off"
				maxLength={10}
				aria-label={label || 'Date'}
			/>
		</div>
	);
}
