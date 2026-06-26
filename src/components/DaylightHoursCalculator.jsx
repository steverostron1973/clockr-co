import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';
import { getSeasonStartUTC } from './SeasonCountdown.jsx';
import { findCityForTimezone, sortedCities } from '../utils/timezoneHelpers';
import {
	calculateSunTimes,
	formatDaylightDuration,
	formatMinutesLocal,
} from '../utils/solarPosition';

function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function cityLabel(city) {
	return `${city.city}, ${city.country}`;
}

function solsticeLocalDate(season, year, timezone) {
	const utc = getSeasonStartUTC(year, season);
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(utc);
	const get = (type) => parts.find((p) => p.type === type)?.value ?? '0';
	return startOfDay(
		new Date(
			parseInt(get('year'), 10),
			parseInt(get('month'), 10) - 1,
			parseInt(get('day'), 10),
		),
	);
}

function formatDateLong(date) {
	return date.toLocaleDateString('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

function daylightForDate(date, city) {
	return calculateSunTimes(date, city.lat, city.lng, city.timezone);
}

function DaylightChart({ times }) {
	const { sunrise, sunset, polarNight, midnightSun } = times;

	if (
		polarNight ||
		midnightSun ||
		sunrise.minutes === null ||
		sunset.minutes === null
	) {
		return (
			<div className="dhc-chart-wrap">
				<div className="dhc-chart-bar dhc-chart-bar--polar">
					<div
						className={`dhc-chart-seg dhc-chart-seg--${midnightSun ? 'day' : 'night'}`}
						style={{ left: 0, width: '100%' }}
					/>
				</div>
				<p className="dhc-polar-note">
					{polarNight
						? 'Polar night — the sun does not rise on this date.'
						: 'Midnight sun — the sun does not set on this date.'}
				</p>
			</div>
		);
	}

	const sunrisePct = (sunrise.minutes / 1440) * 100;
	const sunsetPct = (sunset.minutes / 1440) * 100;
	const dayWidth = sunsetPct - sunrisePct;

	return (
		<div className="dhc-chart-wrap">
			<div className="dhc-chart-bar" aria-hidden="true">
				<div
					className="dhc-chart-seg dhc-chart-seg--night"
					style={{ left: 0, width: `${sunrisePct}%` }}
				/>
				<div
					className="dhc-chart-seg dhc-chart-seg--day"
					style={{ left: `${sunrisePct}%`, width: `${dayWidth}%` }}
				/>
				<div
					className="dhc-chart-seg dhc-chart-seg--night"
					style={{ left: `${sunsetPct}%`, width: `${100 - sunsetPct}%` }}
				/>
				<div
					className="dhc-chart-tick"
					style={{ left: `${sunrisePct}%` }}
				>
					<span className="dhc-chart-tick-label">
						{formatMinutesLocal(sunrise.minutes)}
					</span>
				</div>
				<div
					className="dhc-chart-tick"
					style={{ left: `${sunsetPct}%` }}
				>
					<span className="dhc-chart-tick-label">
						{formatMinutesLocal(sunset.minutes)}
					</span>
				</div>
			</div>
			<div className="dhc-chart-axis">
				<span>00:00</span>
				<span>06:00</span>
				<span>12:00</span>
				<span>18:00</span>
				<span>24:00</span>
			</div>
		</div>
	);
}

export default function DaylightHoursCalculator() {
	const [userTimezone] = useState(
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
	);
	const defaultCity = useMemo(
		() => findCityForTimezone(userTimezone),
		[userTimezone],
	);

	const [selectedCity, setSelectedCity] = useState(defaultCity);
	const [locationQuery, setLocationQuery] = useState(() => cityLabel(defaultCity));
	const [searchQuery, setSearchQuery] = useState('');
	const [pickerOpen, setPickerOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
	const [dateDisplay, setDateDisplay] = useState(() =>
		dateToDisplay(startOfDay(new Date())),
	);

	const pickerRef = useRef(null);
	const skipBlurRef = useRef(false);

	useEffect(() => {
		if (!pickerOpen) return undefined;

		const handleClickOutside = (event) => {
			if (!pickerRef.current?.contains(event.target)) {
				setPickerOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [pickerOpen]);

	const filteredCities = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return sortedCities;
		return sortedCities.filter(
			(c) =>
				c.city.toLowerCase().includes(q) ||
				c.country.toLowerCase().includes(q) ||
				cityLabel(c).toLowerCase().includes(q),
		);
	}, [searchQuery]);

	const times = useMemo(
		() => daylightForDate(selectedDate, selectedCity),
		[selectedDate, selectedCity],
	);

	const year = selectedDate.getFullYear();

	const quickDates = useMemo(
		() => [
			{ id: 'today', label: 'Today', date: startOfDay(new Date()) },
			{
				id: 'summer',
				label: 'Summer Solstice',
				date: solsticeLocalDate('summer', year, selectedCity.timezone),
			},
			{
				id: 'winter',
				label: 'Winter Solstice',
				date: solsticeLocalDate('winter', year, selectedCity.timezone),
			},
			{
				id: 'spring',
				label: 'Spring Equinox',
				date: solsticeLocalDate('spring', year, selectedCity.timezone),
			},
			{
				id: 'autumn',
				label: 'Autumn Equinox',
				date: solsticeLocalDate('autumn', year, selectedCity.timezone),
			},
		],
		[year, selectedCity.timezone],
	);

	const comparisonRows = useMemo(() => {
		const lastYearDate = startOfDay(
			new Date(
				year - 1,
				selectedDate.getMonth(),
				selectedDate.getDate(),
			),
		);
		const rows = [
			{
				id: 'selected',
				label: formatDateLong(selectedDate),
				date: selectedDate,
				highlight: true,
			},
			{
				id: 'summer',
				label: `Summer Solstice ${year}`,
				date: solsticeLocalDate('summer', year, selectedCity.timezone),
			},
			{
				id: 'winter',
				label: `Winter Solstice ${year}`,
				date: solsticeLocalDate('winter', year, selectedCity.timezone),
			},
			{
				id: 'last-year',
				label: 'Same date last year',
				date: lastYearDate,
			},
		];
		return rows.map((row) => {
			const result = daylightForDate(row.date, selectedCity);
			return {
				...row,
				daylightMinutes: result.daylightMinutes,
				sunrise: result.sunrise.minutes,
				sunset: result.sunset.minutes,
			};
		});
	}, [selectedDate, selectedCity, year]);

	const resolveCity = useCallback((city) => {
		return (
			sortedCities.find(
				(c) => c.city === city.city && c.country === city.country,
			) ?? city
		);
	}, []);

	const selectCity = useCallback(
		(city) => {
			const resolved = resolveCity(city);
			setSelectedCity(resolved);
			setLocationQuery(cityLabel(resolved));
			setSearchQuery('');
			setPickerOpen(false);
		},
		[resolveCity],
	);

	function handleLocationChange(e) {
		const value = e.target.value;
		setLocationQuery(value);
		setSearchQuery(value);
		setPickerOpen(true);
		const exact = sortedCities.find((c) => cityLabel(c) === value.trim());
		if (exact) setSelectedCity(exact);
	}

	function handleLocationFocus() {
		setPickerOpen(true);
		setSearchQuery('');
	}

	function handleLocationBlur() {
		setTimeout(() => {
			if (skipBlurRef.current) {
				skipBlurRef.current = false;
				return;
			}
			const exact = sortedCities.find(
				(c) => cityLabel(c) === locationQuery.trim(),
			);
			if (exact) {
				setSelectedCity(exact);
				setLocationQuery(cityLabel(exact));
			} else {
				setLocationQuery(cityLabel(selectedCity));
			}
			setSearchQuery('');
			setPickerOpen(false);
		}, 0);
	}

	function handleDateChange(parsed, masked) {
		setDateDisplay(masked);
		if (parsed instanceof Date && !isNaN(parsed)) {
			setSelectedDate(startOfDay(parsed));
		}
	}

	function setQuickDate(date) {
		setSelectedDate(startOfDay(date));
		setDateDisplay(dateToDisplay(startOfDay(date)));
	}

	return (
		<div className="dhc-tool">
			<div className="dhc-inputs">
				<div className="dhc-location-wrap" ref={pickerRef}>
					<label className="dhc-label" htmlFor="dhc-location">
						Location
					</label>
					<input
						id="dhc-location"
						type="search"
						className="dhc-location-input"
						value={locationQuery}
						onChange={handleLocationChange}
						onBlur={handleLocationBlur}
						onFocus={handleLocationFocus}
						autoComplete="off"
						placeholder="Search 250+ cities…"
					/>
					{pickerOpen && (
						<ul className="dhc-picker-list" role="listbox">
							{filteredCities.length === 0 ? (
								<li className="dhc-picker-empty">No cities found</li>
							) : (
								filteredCities.map((city) => (
									<li key={`${city.city}-${city.country}`}>
										<button
											type="button"
											className="dhc-picker-item"
											onMouseDown={(e) => {
												e.preventDefault();
												skipBlurRef.current = true;
											}}
											onClick={() => selectCity(city)}
										>
											{city.flag} {city.city}, {city.country}
										</button>
									</li>
								))
							)}
						</ul>
					)}
				</div>

				<div className="dhc-date-wrap">
					<DateInput
						id="dhc-date"
						label="Date"
						value={dateDisplay}
						onChange={handleDateChange}
					/>
				</div>
			</div>

			<div className="dhc-quick-dates" role="group" aria-label="Quick date links">
				{quickDates.map((item) => (
					<button
						key={item.id}
						type="button"
						className={`dhc-quick-btn${
							selectedDate.getTime() === item.date.getTime()
								? ' dhc-quick-btn--active'
								: ''
						}`}
						onClick={() => setQuickDate(item.date)}
					>
						{item.label}
					</button>
				))}
			</div>

			<section className="dhc-hero-band" aria-label="Daylight hours results">
				<div className="dhc-hero-centre">
					<p className="dhc-result-location">
						{selectedCity.flag} {cityLabel(selectedCity)}
					</p>
					<p className="dhc-result-date">{formatDateLong(selectedDate)}</p>

					<p className="dhc-daylight-hero">
						{formatDaylightDuration(times.daylightMinutes)}
					</p>

					<div className="dhc-sun-times">
						<div className="dhc-sun-time">
							<span className="dhc-sun-time-label">Sunrise</span>
							<span className="dhc-sun-time-value">
								{formatMinutesLocal(times.sunrise.minutes)}
							</span>
						</div>
						<div className="dhc-sun-time">
							<span className="dhc-sun-time-label">Sunset</span>
							<span className="dhc-sun-time-value">
								{formatMinutesLocal(times.sunset.minutes)}
							</span>
						</div>
					</div>

					<DaylightChart times={times} />
				</div>
			</section>

			<section className="dhc-compare" aria-label="Daylight comparison">
				<h2 className="dhc-compare-title">How does today compare?</h2>
				<div className="dhc-compare-table-wrap">
					<table className="dhc-compare-table">
						<thead>
							<tr>
								<th scope="col">Date</th>
								<th scope="col">Daylight</th>
								<th scope="col">Sunrise</th>
								<th scope="col">Sunset</th>
							</tr>
						</thead>
						<tbody>
							{comparisonRows.map((row) => (
								<tr
									key={row.id}
									className={row.highlight ? 'dhc-compare-row--highlight' : ''}
								>
									<td>{row.label}</td>
									<td>{formatDaylightDuration(row.daylightMinutes)}</td>
									<td>{formatMinutesLocal(row.sunrise)}</td>
									<td>{formatMinutesLocal(row.sunset)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
