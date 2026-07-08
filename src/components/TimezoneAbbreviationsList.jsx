import { useMemo, useState } from 'react';
import abbreviations from '../data/timezoneAbbreviations.json';

function entryKey(entry) {
	return `${entry.abbreviation}-${entry.fullName}`;
}

function buildAmbiguousSet(entries) {
	const counts = new Map();
	for (const e of entries) {
		counts.set(e.abbreviation, (counts.get(e.abbreviation) ?? 0) + 1);
	}
	return new Set(
		[...counts.entries()].filter(([, n]) => n > 1).map(([abbr]) => abbr),
	);
}

const ambiguousAbbreviations = buildAmbiguousSet(abbreviations);

const sortedAbbreviations = [...abbreviations].sort((a, b) => {
	const abbr = a.abbreviation.localeCompare(b.abbreviation);
	if (abbr !== 0) return abbr;
	return a.fullName.localeCompare(b.fullName);
});

function matchesQuery(entry, q) {
	if (entry.abbreviation.toLowerCase().startsWith(q)) return true;
	if (entry.fullName.toLowerCase().includes(q)) return true;
	if (entry.region.toLowerCase().includes(q)) return true;
	if (entry.utcOffset.toLowerCase().includes(q)) return true;
	return false;
}

export default function TimezoneAbbreviationsList() {
	const [query, setQuery] = useState('');

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return sortedAbbreviations;

		return sortedAbbreviations.filter((entry) => matchesQuery(entry, q));
	}, [query]);

	return (
		<div className="tza-tool">
			<div className="tza-controls">
				<label className="tza-search-label" htmlFor="tza-search">
					Search abbreviations
				</label>
				<input
					id="tza-search"
					type="search"
					className="tza-search"
					placeholder="Search by abbreviation or name…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoComplete="off"
				/>
				<p className="tza-count" aria-live="polite">
					{filtered.length} abbreviation{filtered.length === 1 ? '' : 's'} shown
				</p>
			</div>

			{filtered.length === 0 ? (
				<p className="tza-empty">No abbreviations match that search.</p>
			) : (
				<div className="tza-table-wrap">
					<table className="tza-table">
						<thead>
							<tr>
								<th scope="col">Abbreviation</th>
								<th scope="col">Full name</th>
								<th scope="col">UTC offset</th>
								<th scope="col">Region / notes</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((entry) => {
								const isAmbiguous = ambiguousAbbreviations.has(
									entry.abbreviation,
								);
								return (
									<tr key={entryKey(entry)}>
										<td className="tza-abbr">
											<span className="tza-abbr-code">{entry.abbreviation}</span>
											{isAmbiguous && (
												<span
													className="tza-ambig-badge"
													title="This abbreviation is used in more than one time zone"
												>
													Ambiguous
												</span>
											)}
										</td>
										<td className="tza-name">{entry.fullName}</td>
										<td className="tza-offset">{entry.utcOffset}</td>
										<td className="tza-region">{entry.region}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<p className="tza-disclaimer">
				Offsets shown are standard-time values. Daylight saving variants (e.g. EST
				vs EDT) are listed separately where they are commonly used. Always confirm
				the exact zone for your location — abbreviations alone are not unique
				worldwide.
			</p>
		</div>
	);
}
