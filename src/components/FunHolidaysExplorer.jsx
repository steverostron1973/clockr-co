import { useMemo, useState } from 'react';
import holidays from '../data/funHolidays.json';

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

const CATEGORIES = ['All', 'Food', 'Fun', 'Awareness', 'Internet Culture'];

function todayKey() {
	const now = new Date();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${m}-${d}`;
}

function formatDateLabel(mmdd) {
	const [mm, dd] = mmdd.split('-').map(Number);
	return `${MONTH_NAMES[mm - 1]} ${dd}`;
}

function monthIndex(mmdd) {
	return Number(mmdd.slice(0, 2)) - 1;
}

export default function FunHolidaysExplorer() {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('All');
	const today = todayKey();

	const todaysHolidays = useMemo(
		() => holidays.filter((h) => h.date === today),
		[today],
	);

	const filteredByMonth = useMemo(() => {
		const q = query.trim().toLowerCase();
		const filtered = holidays.filter((h) => {
			const catOk = category === 'All' || h.category === category;
			if (!catOk) return false;
			if (!q) return true;
			return (
				h.name.toLowerCase().includes(q) ||
				h.description.toLowerCase().includes(q) ||
				h.category.toLowerCase().includes(q) ||
				formatDateLabel(h.date).toLowerCase().includes(q)
			);
		});

		const groups = MONTH_NAMES.map((name, index) => ({
			name,
			index,
			items: filtered.filter((h) => monthIndex(h.date) === index),
		})).filter((g) => g.items.length > 0);

		return { groups, total: filtered.length };
	}, [query, category]);

	return (
		<div className="fh-tool">
			<section className="fh-today" aria-label="Today's fun holidays">
				<div className="fh-today-header">
					<span className="fh-today-eyebrow">Today</span>
					<h2 className="fh-today-title">
						{formatDateLabel(today)}
					</h2>
				</div>

				{todaysHolidays.length === 0 ? (
					<p className="fh-today-empty">
						No quirky holidays on our list for today — browse the calendar
						below for the next celebration.
					</p>
				) : (
					<ul className="fh-today-list">
						{todaysHolidays.map((h) => (
							<li key={`${h.date}-${h.name}`} className="fh-today-item">
								<span className="fh-pill">{h.category}</span>
								<h3 className="fh-today-name">{h.name}</h3>
								<p className="fh-today-desc">{h.description}</p>
							</li>
						))}
					</ul>
				)}
			</section>

			<div className="fh-controls">
				<label className="fh-search-label" htmlFor="fh-search">
					Search holidays
				</label>
				<input
					id="fh-search"
					type="search"
					className="fh-search"
					placeholder="Search by name, date, or keyword…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoComplete="off"
				/>

				<div className="fh-filters" role="group" aria-label="Filter by category">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							type="button"
							className={`fh-filter-btn${category === cat ? ' fh-filter-btn--active' : ''}`}
							aria-pressed={category === cat}
							onClick={() => setCategory(cat)}
						>
							{cat}
						</button>
					))}
				</div>

				<p className="fh-count" aria-live="polite">
					{filteredByMonth.total} holiday
					{filteredByMonth.total === 1 ? '' : 's'} shown
				</p>
			</div>

			{filteredByMonth.groups.length === 0 ? (
				<p className="fh-empty">No holidays match that search or filter.</p>
			) : (
				<div className="fh-months">
					{filteredByMonth.groups.map((group) => (
						<section
							key={group.name}
							className="fh-month"
							aria-labelledby={`fh-month-${group.index}`}
						>
							<h2 className="fh-month-title" id={`fh-month-${group.index}`}>
								{group.name}
							</h2>
							<ul className="fh-list">
								{group.items.map((h) => (
									<li key={`${h.date}-${h.name}`} className="fh-card">
										<div className="fh-card-top">
											<span className="fh-card-date">
												{formatDateLabel(h.date)}
											</span>
											<span className="fh-pill">{h.category}</span>
										</div>
										<h3 className="fh-card-name">{h.name}</h3>
										<p className="fh-card-desc">{h.description}</p>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
