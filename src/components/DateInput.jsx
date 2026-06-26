import { useEffect, useState } from 'react';

export function formatDateMask(raw) {
	const digits = raw.replace(/\D/g, '').slice(0, 8);
	if (digits.length === 0) return '';
	if (digits.length <= 2) {
		return digits.length === 2 ? `${digits}/` : digits;
	}
	if (digits.length <= 4) {
		const formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
		return digits.length === 4 ? `${formatted}/` : formatted;
	}
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

function segmentStartForPosition(pos) {
	if (pos <= 2) return 0;
	if (pos <= 5) return 3;
	return 6;
}

function segmentMeta(start) {
	if (start === 0) return { start: 0, end: 2, digitOffset: 0, digitLen: 2 };
	if (start === 3) return { start: 3, end: 5, digitOffset: 2, digitLen: 2 };
	return { start: 6, end: 10, digitOffset: 4, digitLen: 4 };
}

function segmentForPosition(pos) {
	return segmentMeta(segmentStartForPosition(pos));
}

function selectSegment(input, start) {
	const { end } = segmentMeta(start);
	requestAnimationFrame(() => input.setSelectionRange(start, end));
}

function selectSegmentForPosition(input, pos) {
	selectSegment(input, segmentStartForPosition(pos));
}

function indexInSegment(selStart, selEnd, seg) {
	if (selEnd - selStart >= seg.digitLen) return 0;
	const offset = selStart - seg.start;
	return Math.max(0, Math.min(seg.digitLen - 1, offset));
}

const DEFAULT_INPUT_CLASS = 'date-input-default';
const DEFAULT_LABEL_CLASS = 'date-input-label-default';
const DEFAULT_WRAP_CLASS = 'date-input-wrap-default';

export default function DateInput({
	id,
	label,
	value,
	onChange,
	placeholder = 'dd/mm/yyyy',
	inputClassName = DEFAULT_INPUT_CLASS,
	labelClassName = DEFAULT_LABEL_CLASS,
	wrapClassName = DEFAULT_WRAP_CLASS,
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

	function applyMasked(input, masked) {
		setDisplay(masked);
		notifyChange(masked);
	}

	function handleChange(e) {
		const input = e.target;
		const prevDigits = digitCount(display);
		const masked = formatDateMask(input.value);
		const newDigits = digitCount(masked);
		applyMasked(input, masked);

		if (newDigits === 2 && prevDigits < 2) {
			selectSegment(input, 3);
		} else if (newDigits === 4 && prevDigits < 4) {
			selectSegment(input, 6);
		} else {
			placeCaretForDigits(input, newDigits);
		}
	}

	function handleKeyDown(e) {
		const input = e.target;
		const key = e.key;

		if (display.length !== 10) return;

		if (key === 'ArrowLeft') {
			e.preventDefault();
			const pos = input.selectionStart ?? 0;
			const seg = segmentForPosition(pos);
			if (seg.start === 0) selectSegment(input, 0);
			else if (seg.start === 3) selectSegment(input, 0);
			else selectSegment(input, 3);
			return;
		}

		if (key === 'ArrowRight') {
			e.preventDefault();
			const pos = input.selectionStart ?? 0;
			const seg = segmentForPosition(pos);
			if (seg.start === 0) selectSegment(input, 3);
			else if (seg.start === 3) selectSegment(input, 6);
			else selectSegment(input, 6);
			return;
		}

		if (!/^\d$/.test(key)) return;

		e.preventDefault();

		const selStart = input.selectionStart ?? 0;
		const selEnd = input.selectionEnd ?? selStart;
		const seg = segmentForPosition(selStart);
		const idxInSeg = indexInSegment(selStart, selEnd, seg);

		const chars = display.replace(/\D/g, '').split('');
		while (chars.length < 8) chars.push('0');
		chars[seg.digitOffset + idxInSeg] = key;

		const masked = formatDateMask(chars.join(''));
		applyMasked(input, masked);

		const nextIdxInSeg = idxInSeg + 1;
		if (nextIdxInSeg >= seg.digitLen) {
			if (seg.start === 0) selectSegment(input, 3);
			else if (seg.start === 3) selectSegment(input, 6);
			else requestAnimationFrame(() => input.setSelectionRange(10, 10));
		} else {
			const nextPos = seg.start + nextIdxInSeg;
			requestAnimationFrame(() => input.setSelectionRange(nextPos, nextPos + 1));
		}
	}

	function handleClick(e) {
		const input = e.target;
		const pos = input.selectionStart ?? 0;
		selectSegmentForPosition(input, pos);
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
				onKeyDown={handleKeyDown}
				onClick={handleClick}
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
