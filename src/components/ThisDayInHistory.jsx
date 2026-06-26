import { useCallback, useEffect, useMemo, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';

const TABS = [
	{ id: 'events', label: 'Events' },
	{ id: 'births', label: 'Births' },
	{ id: 'deaths', label: 'Deaths' },
];

const MIN_YEAR = 1900;

const EMPTY_MESSAGES = {
	events: 'No events found for this date.',
	births: 'No births found for this date.',
	deaths: 'No deaths found for this date.',
};

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return startOfDay(result);
}

function formatDayMonth(date) {
	return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

function formatYear(year) {
	if (year < 0) return `${Math.abs(year)} BC`;
	return String(year);
}

function getApiUrl(month, day) {
	const mm = String(month).padStart(2, '0');
	const dd = String(day).padStart(2, '0');
	return `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`;
}

function pageLinkCount(item) {
	return item.pages?.length ?? 0;
}

function getDecade(year) {
	return Math.floor(year / 10) * 10;
}

function pickBestFromDecade(entries) {
	if (!entries.length) return null;

	let best = entries[0];
	let bestLinks = pageLinkCount(best);

	for (let i = 1; i < entries.length; i++) {
		const links = pageLinkCount(entries[i]);
		if (links > bestLinks) {
			best = entries[i];
			bestLinks = links;
		}
	}

	return best;
}

function curateEntries(items) {
	const modern = (items ?? []).filter((item) => item.year >= MIN_YEAR);
	if (!modern.length) return [];

	const byDecade = new Map();
	for (const item of modern) {
		const decade = getDecade(item.year);
		if (!byDecade.has(decade)) byDecade.set(decade, []);
		byDecade.get(decade).push(item);
	}

	const selected = [];
	for (const decade of [...byDecade.keys()].sort((a, b) => a - b)) {
		const pick = pickBestFromDecade(byDecade.get(decade));
		if (pick) selected.push(pick);
	}

	return selected.sort((a, b) => a.year - b.year);
}

function getWikiUrl(item) {
	const page = item.pages?.[0];
	if (!page) return null;
	if (page.content_urls?.desktop?.page) return page.content_urls.desktop.page;
	const title = page.titles?.canonical || page.title;
	if (!title) return null;
	return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

function HistoryItem({ item }) {
	const wikiUrl = getWikiUrl(item);

	return (
		<article className="tdih-item">
			<div className="tdih-item-year">{formatYear(item.year)}</div>
			<div className="tdih-item-body">
				<p className="tdih-item-text">{item.text}</p>
				{wikiUrl && (
					<a
						href={wikiUrl}
						className="tdih-read-more"
						target="_blank"
						rel="noopener noreferrer"
					>
						Read more
					</a>
				)}
			</div>
		</article>
	);
}

function LoadingSkeleton() {
	return (
		<div className="tdih-loading" aria-live="polite" aria-busy="true">
			<div className="tdih-spinner" aria-hidden="true" />
			<p className="tdih-loading-text">Loading history for this day…</p>
			<div className="tdih-skeleton-list">
				{[1, 2, 3].map((n) => (
					<div key={n} className="tdih-skeleton-card" />
				))}
			</div>
		</div>
	);
}

export default function ThisDayInHistory() {
	const today = startOfDay(new Date());
	const [viewMonth, setViewMonth] = useState(() => today.getMonth() + 1);
	const [viewDay, setViewDay] = useState(() => today.getDate());
	const [selectedDate, setSelectedDate] = useState(() => today);
	const [dateDisplay, setDateDisplay] = useState(() => dateToDisplay(today));
	const [activeTab, setActiveTab] = useState('events');
	const [apiData, setApiData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const fetchHistory = useCallback(async (month, day) => {
		setLoading(true);
		setError(false);
		try {
			const response = await fetch(getApiUrl(month, day));
			if (!response.ok) throw new Error('fetch failed');
			const json = await response.json();
			setApiData(json);
		} catch {
			setApiData(null);
			setError(true);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchHistory(viewMonth, viewDay);
	}, [viewMonth, viewDay, fetchHistory]);

	const curated = useMemo(
		() => ({
			events: curateEntries(apiData?.events),
			births: curateEntries(apiData?.births),
			deaths: curateEntries(apiData?.deaths),
		}),
		[apiData],
	);

	const items = curated[activeTab] ?? [];

	function applyDate(date) {
		const next = startOfDay(date);
		setViewMonth(next.getMonth() + 1);
		setViewDay(next.getDate());
		setSelectedDate(next);
		setDateDisplay(dateToDisplay(next));
	}

	function goToPreviousDay() {
		applyDate(addDays(selectedDate, -1));
	}

	function goToNextDay() {
		applyDate(addDays(selectedDate, 1));
	}

	function handleDateChange(parsed, masked) {
		setDateDisplay(masked);
		if (parsed) {
			applyDate(parsed);
		}
	}

	return (
		<div className="tdih-tool">
			<div className="tdih-date-nav">
				<button
					type="button"
					className="tdih-nav-btn"
					onClick={goToPreviousDay}
					aria-label="Previous day"
				>
					←
				</button>
				<div className="tdih-date-display">{formatDayMonth(selectedDate)}</div>
				<button
					type="button"
					className="tdih-nav-btn"
					onClick={goToNextDay}
					aria-label="Next day"
				>
					→
				</button>
			</div>

			<div className="tdih-date-input-wrap">
				<DateInput
					id="tdih-date"
					label="Jump to a specific date"
					value={dateDisplay}
					onChange={handleDateChange}
				/>
			</div>

			<div className="tdih-tabs" role="tablist" aria-label="History categories">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						className={`tdih-tab${activeTab === tab.id ? ' tdih-tab--active' : ''}`}
						aria-selected={activeTab === tab.id}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<section className="tdih-results" aria-label={`Historical ${activeTab}`}>
				{loading && <LoadingSkeleton />}

				{!loading && error && (
					<div className="tdih-error" role="alert">
						<p>We couldn&apos;t load today&apos;s history right now. Please try again in a moment.</p>
						<button
							type="button"
							className="tdih-retry-btn"
							onClick={() => fetchHistory(viewMonth, viewDay)}
						>
							Try again
						</button>
					</div>
				)}

				{!loading && !error && items.length === 0 && (
					<p className="tdih-empty">{EMPTY_MESSAGES[activeTab]}</p>
				)}

				{!loading && !error && items.length > 0 && (
					<div className="tdih-list" role="tabpanel">
						{items.map((item) => (
							<HistoryItem
								key={`${activeTab}-${item.year}-${(item.text ?? '').slice(0, 40)}`}
								item={item}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
