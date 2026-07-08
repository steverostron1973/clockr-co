import { jsPDF } from 'jspdf';

export type CalendarStyle = 'minimal' | 'notes';

const MONTH_NAMES = [
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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday = 0 … Sunday = 6 */
export function firstWeekdayMon0(year: number, month: number): number {
	const day = new Date(year, month - 1, 1).getDay();
	return (day + 6) % 7;
}

export function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

function drawMonthGrid(
	doc: jsPDF,
	x: number,
	y: number,
	width: number,
	height: number,
	year: number,
	month: number,
	style: CalendarStyle,
	compact: boolean,
) {
	const cols = 7;
	const rows = 6;
	const titleH = compact ? 7 : 10;
	const dayLabelH = compact ? 4 : 6;
	const gridTop = y + titleH + dayLabelH;
	const gridHeight = height - titleH - dayLabelH;
	const cellW = width / cols;
	const cellH = gridHeight / rows;

	doc.setTextColor(0, 0, 0);
	doc.setFontSize(compact ? 9 : 16);
	doc.setFont('helvetica', 'bold');
	doc.text(
		`${MONTH_NAMES[month - 1]}${compact ? '' : ` ${year}`}`,
		x + width / 2,
		y + (compact ? 5 : 7),
		{ align: 'center' },
	);

	doc.setFontSize(compact ? 6 : 9);
	doc.setFont('helvetica', 'normal');
	for (let i = 0; i < cols; i++) {
		doc.text(
			DAY_LABELS[i],
			x + i * cellW + cellW / 2,
			y + titleH + (compact ? 3 : 4),
			{ align: 'center' },
		);
	}

	const firstDay = firstWeekdayMon0(year, month);
	const totalDays = daysInMonth(year, month);
	let dayNum = 1;

	doc.setDrawColor(160, 160, 160);
	doc.setLineWidth(compact ? 0.15 : 0.25);

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const cellX = x + col * cellW;
			const cellY = gridTop + row * cellH;
			doc.rect(cellX, cellY, cellW, cellH);

			const cellIndex = row * cols + col;
			if (cellIndex >= firstDay && dayNum <= totalDays) {
				doc.setFontSize(compact ? 7 : style === 'notes' ? 10 : 11);
				doc.setFont('helvetica', 'bold');
				doc.text(String(dayNum), cellX + (compact ? 1.5 : 2.5), cellY + (compact ? 4 : 6));

				if (style === 'notes' && !compact) {
					doc.setDrawColor(210, 210, 210);
					doc.setLineWidth(0.1);
					const lineStart = cellY + 9;
					const lineCount = 3;
					const lineGap = (cellH - 10) / lineCount;
					for (let ln = 0; ln < lineCount; ln++) {
						const ly = lineStart + ln * lineGap;
						doc.line(cellX + 2, ly, cellX + cellW - 2, ly);
					}
					doc.setDrawColor(160, 160, 160);
					doc.setLineWidth(compact ? 0.15 : 0.25);
				}

				dayNum++;
			}
		}
	}
}

function addBranding(doc: jsPDF, pageW: number, footerY: number) {
	doc.setFontSize(7);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(130, 130, 130);
	doc.text('clockr.co', pageW / 2, footerY, { align: 'center' });
}

export function monthlyPdfFilename(year: number, month: number): string {
	return `calendar-${MONTH_NAMES[month - 1].toLowerCase()}-${year}.pdf`;
}

export function yearlyPdfFilename(year: number): string {
	return `calendar-${year}.pdf`;
}

export function generateMonthlyPdf(
	year: number,
	month: number,
	style: CalendarStyle,
): void {
	const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
	const pageW = 210;
	const margin = 18;
	const gridW = pageW - margin * 2;
	const gridH = style === 'notes' ? 230 : 220;

	drawMonthGrid(doc, margin, margin + 6, gridW, gridH, year, month, style, false);
	addBranding(doc, pageW, 287);
	doc.save(monthlyPdfFilename(year, month));
}

export function generateYearlyPdf(year: number, style: CalendarStyle): void {
	const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
	const pageW = 297;
	const pageH = 210;
	const margin = 12;
	const titleY = 10;

	doc.setTextColor(0, 0, 0);
	doc.setFontSize(18);
	doc.setFont('helvetica', 'bold');
	doc.text(String(year), pageW / 2, titleY, { align: 'center' });

	const cols = 4;
	const rows = 3;
	const gap = 5;
	const top = titleY + 6;
	const usableW = pageW - margin * 2;
	const usableH = pageH - top - margin - 6;
	const cellW = (usableW - gap * (cols - 1)) / cols;
	const cellH = (usableH - gap * (rows - 1)) / rows;

	for (let month = 1; month <= 12; month++) {
		const idx = month - 1;
		const col = idx % cols;
		const row = Math.floor(idx / cols);
		const x = margin + col * (cellW + gap);
		const y = top + row * (cellH + gap);
		drawMonthGrid(doc, x, y, cellW, cellH, year, month, 'minimal', true);
	}

	addBranding(doc, pageW, pageH - 5);
	doc.save(yearlyPdfFilename(year));
}
