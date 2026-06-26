import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DateInput, { dateToDisplay } from './DateInput.jsx';
import { getSeasonStartUTC } from './SeasonCountdown.jsx';
import { findCityForTimezone, sortedCities } from '../utils/timezoneHelpers';
import {
	calculateSunTimes,
	formatDaylightDuration,
	formatMinutesLocal,
	getCurrentLocalMinutes,
	isSameLocalDay,
} from '../utils/solarPosition';

function SunIllustration() {
	const cx = 100;
	const cy = 100;
	const innerR = 54;
	const outerR = 96;
	const rayCount = 10;
	const raySpread = 7;

	const rays = Array.from({ length: rayCount }, (_, i) => {
		const deg = (i * 360) / rayCount;
		const toRad = (d) => (d * Math.PI) / 180;
		const tip = {
			x: cx + outerR * Math.sin(toRad(deg)),
			y: cy - outerR * Math.cos(toRad(deg)),
		};
		const baseL = {
			x: cx + innerR * Math.sin(toRad(deg - raySpread)),
			y: cy - innerR * Math.cos(toRad(deg - raySpread)),
		};
		const baseR = {
			x: cx + innerR * Math.sin(toRad(deg + raySpread)),
			y: cy - innerR * Math.cos(toRad(deg + raySpread)),
		};
		return `${tip.x},${tip.y} ${baseL.x},${baseL.y} ${baseR.x},${baseR.y}`;
	});

	return (
		<div className="sunc-sun-wrap" aria-hidden="true">
			<svg
				className="sunc-sun-svg"
				viewBox="0 0 200 200"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-label=""
			>
				<defs>
					<radialGradient id="sunc-disc-gradient" cx="42%" cy="38%" r="62%">
						<stop offset="0%" stopColor="#FCD34D" />
						<stop offset="72%" stopColor="#FBBF24" />
						<stop offset="100%" stopColor="#F59E0B" />
					</radialGradient>
					<linearGradient id="sunc-ray-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#FDE68A" />
						<stop offset="100%" stopColor="#F59E0B" />
					</linearGradient>
					<filter id="sunc-sun-glow" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation="10" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<g className="sunc-sun-rays">
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 100 100"
						to="360 100 100"
						dur="20s"
						repeatCount="indefinite"
					/>
					{rays.map((points, i) => (
						<polygon
							key={`sunc-ray-${i}`}
							points={points}
							fill="url(#sunc-ray-gradient)"
							opacity="0.92"
						/>
					))}
				</g>

				<circle
					className="sunc-sun-disc"
					cx={cx}
					cy={cy}
					r={50}
					fill="url(#sunc-disc-gradient)"
					filter="url(#sunc-sun-glow)"
				/>
			</svg>
		</div>
	);
}

const sunIllustrationStyles = `
	.sunc-sun-wrap {
		display: flex;
		justify-content: center;
		margin: 0 0 36px;
		padding-top: 4px;
	}

	.sunc-sun-svg {
		width: 200px;
		height: 200px;
		overflow: visible;
		filter: drop-shadow(0 0 28px rgba(251, 191, 36, 0.5))
			drop-shadow(0 0 56px rgba(245, 158, 11, 0.25));
	}

	@media (max-width: 600px) {
		.sunc-sun-svg {
			width: 160px;
			height: 160px;
		}

		.sunc-sun-wrap {
			margin-bottom: 28px;
		}
	}
`;

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

function DaylightBar({ times, timezone, isToday }) {
	const [nowMinutes, setNowMinutes] = useState(() =>
		getCurrentLocalMinutes(timezone),
	);

	useEffect(() => {
		if (!isToday) return undefined;
		const id = setInterval(
			() => setNowMinutes(getCurrentLocalMinutes(timezone)),
			60_000,
		);
		return () => clearInterval(id);
	}, [isToday, timezone]);

	const segments = useMemo(() => {
		const { dawn, sunrise, sunset, dusk } = times;
		if (
			dawn.minutes === null ||
			sunrise.minutes === null ||
			sunset.minutes === null ||
			dusk.minutes === null
		) {
			return null;
		}

		const toPct = (m) => (m / 1440) * 100;
		return [
			{ kind: 'night', left: 0, width: toPct(dawn.minutes) },
			{
				kind: 'dawn',
				left: toPct(dawn.minutes),
				width: toPct(sunrise.minutes - dawn.minutes),
			},
			{
				kind: 'day',
				left: toPct(sunrise.minutes),
				width: toPct(sunset.minutes - sunrise.minutes),
			},
			{
				kind: 'dusk',
				left: toPct(sunset.minutes),
				width: toPct(dusk.minutes - sunset.minutes),
			},
			{
				kind: 'night',
				left: toPct(dusk.minutes),
				width: 100 - toPct(dusk.minutes),
			},
		];
	}, [times]);

	if (!segments) {
		return (
			<div className="sunc-daylight-bar-wrap">
				<p className="sunc-polar-note">
					{times.polarNight
						? 'Polar night — the sun does not rise on this date.'
						: times.midnightSun
							? 'Midnight sun — the sun does not set on this date.'
							: 'Sun times are not available for this location and date.'}
				</p>
			</div>
		);
	}

	return (
		<div className="sunc-daylight-bar-wrap">
			<div className="sunc-daylight-bar" aria-hidden="true">
				{segments.map((seg) => (
					<div
						key={`${seg.kind}-${seg.left}`}
						className={`sunc-daylight-seg sunc-daylight-seg--${seg.kind}`}
						style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
					/>
				))}
				{isToday && (
					<div
						className="sunc-daylight-now"
						style={{ left: `${(nowMinutes / 1440) * 100}%` }}
						aria-hidden="true"
					/>
				)}
			</div>
			<div className="sunc-daylight-labels">
				<span>00:00</span>
				<span>06:00</span>
				<span>12:00</span>
				<span>18:00</span>
				<span>24:00</span>
			</div>
		</div>
	);
}

export default function SunCalculator() {
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
	const [now, setNow] = useState(() => new Date());

	const pickerRef = useRef(null);
	const inputRef = useRef(null);
	const skipBlurRef = useRef(false);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

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
		() =>
			calculateSunTimes(
				selectedDate,
				selectedCity.lat,
				selectedCity.lng,
				selectedCity.timezone,
			),
		[selectedDate, selectedCity.lat, selectedCity.lng, selectedCity.timezone],
	);

	const isToday = useMemo(
		() => isSameLocalDay(selectedDate, selectedCity.timezone, now),
		[selectedDate, selectedCity.timezone, now],
	);

	const year = selectedDate.getFullYear();

	const quickDates = useMemo(
		() => [
			{ id: 'today', label: 'Today', date: startOfDay(new Date()) },
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
				id: 'spring',
				label: `Spring Equinox ${year}`,
				date: solsticeLocalDate('spring', year, selectedCity.timezone),
			},
			{
				id: 'autumn',
				label: `Autumn Equinox ${year}`,
				date: solsticeLocalDate('autumn', year, selectedCity.timezone),
			},
		],
		[year, selectedCity.timezone],
	);

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
		if (parsed) setSelectedDate(startOfDay(parsed));
	}

	function setQuickDate(date) {
		setSelectedDate(startOfDay(date));
		setDateDisplay(dateToDisplay(startOfDay(date)));
	}

	return (
		<div className="sunc-tool">
			<SunIllustration />
			<div className="sunc-inputs">
				<div className="sunc-location-wrap" ref={pickerRef}>
					<label className="sunc-label" htmlFor="sunc-location">
						Location
					</label>
					<input
						ref={inputRef}
						id="sunc-location"
						type="search"
						className="sunc-location-input"
						value={locationQuery}
						onChange={handleLocationChange}
						onBlur={handleLocationBlur}
						onFocus={handleLocationFocus}
						autoComplete="off"
						placeholder="Search 250+ cities…"
					/>
					{pickerOpen && (
						<ul className="sunc-picker-list" role="listbox">
							{filteredCities.length === 0 ? (
								<li className="sunc-picker-empty">No cities found</li>
							) : (
								filteredCities.map((city) => (
									<li key={`${city.city}-${city.country}`}>
										<button
											type="button"
											className="sunc-picker-item"
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

				<div className="sunc-date-wrap">
					<DateInput
						id="sunc-date"
						label="Date"
						value={dateDisplay}
						onChange={handleDateChange}
					/>
				</div>
			</div>

			<div className="sunc-quick-dates" role="group" aria-label="Quick date links">
				{quickDates.map((item) => (
					<button
						key={item.id}
						type="button"
						className={`sunc-quick-btn${
							selectedDate.getTime() === item.date.getTime()
								? ' sunc-quick-btn--active'
								: ''
						}`}
						onClick={() => setQuickDate(item.date)}
					>
						{item.label}
					</button>
				))}
			</div>

			<section className="sunc-hero-band" aria-label="Sun times results">
				<div className="sunc-hero-centre">
					<p className="sunc-result-location">
						{selectedCity.flag} {cityLabel(selectedCity)}
					</p>
					<p className="sunc-result-date">{formatDateLong(selectedDate)}</p>

					<p className="sunc-daylight-hero">
						{formatDaylightDuration(times.daylightMinutes)}
						<span className="sunc-daylight-hero-label"> of daylight</span>
					</p>

					<DaylightBar
						times={times}
						timezone={selectedCity.timezone}
						isToday={isToday}
					/>

					<div className="sunc-stats-grid">
						<div className="sunc-stat">
							<span className="sunc-stat-value">
								{formatMinutesLocal(times.sunrise.minutes)}
							</span>
							<span className="sunc-stat-label">Sunrise</span>
						</div>
						<div className="sunc-stat">
							<span className="sunc-stat-value">
								{formatMinutesLocal(times.sunset.minutes)}
							</span>
							<span className="sunc-stat-label">Sunset</span>
						</div>
						<div className="sunc-stat">
							<span className="sunc-stat-value">
								{formatMinutesLocal(times.solarNoon.minutes)}
							</span>
							<span className="sunc-stat-label">Solar noon</span>
						</div>
						<div className="sunc-stat">
							<span className="sunc-stat-value">
								{formatMinutesLocal(times.dawn.minutes)}
							</span>
							<span className="sunc-stat-label">Dawn (civil)</span>
						</div>
						<div className="sunc-stat">
							<span className="sunc-stat-value">
								{formatMinutesLocal(times.dusk.minutes)}
							</span>
							<span className="sunc-stat-label">Dusk (civil)</span>
						</div>
					</div>
				</div>
			</section>
			<style>{sunIllustrationStyles}</style>
		</div>
	);
}
