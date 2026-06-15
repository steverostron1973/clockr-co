import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findCityForTimezone, sortedCities, wallClockToUtc } from '../utils/timezoneHelpers';

const MAX_ZONES = 6;
const GOOD_COLOR = '#2DD4BF';
const OKAY_COLOR = '#FBBF24';
const BAD_COLOR = '#4A4A55';

const contrastStyles = `
	.mp-tool .mp-slider-label {
		color: #b0b0b0;
	}
	.mp-tool .mp-slider-tick {
		color: #b0b0b0;
	}
	.mp-tool .mp-row-badge {
		color: #b0b0b0;
	}
	.mp-tool .mp-row-city {
		color: #f5f5f5;
	}
	.mp-tool .mp-time-display {
		color: #f5f5f5;
	}
	.mp-tool .mp-legend-item {
		color: #b0b0b0;
	}
	.mp-tool .mp-remove {
		color: #b0b0b0;
	}
	.mp-tool .mp-picker-added {
		color: #b0b0b0;
	}
	.mp-tool .mp-picker-empty {
		color: #b0b0b0;
	}
	.mp-tool .mp-slider {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.14) 0%,
			rgba(45, 212, 191, 0.28) 35%,
			rgba(0, 153, 255, 0.28) 65%,
			rgba(255, 255, 255, 0.14) 100%
		);
	}
`;

function getHourQuality(hour) {
	if (hour >= 9 && hour <= 16) return 'good';
	if ((hour >= 7 && hour <= 8) || (hour >= 17 && hour <= 19)) return 'okay';
	return 'bad';
}

function hourBlockColor(hour) {
	const quality = getHourQuality(hour);
	if (quality === 'good') return GOOD_COLOR;
	if (quality === 'okay') return OKAY_COLOR;
	return BAD_COLOR;
}

function roundToNearest30Minutes(date) {
	const minutes = date.getHours() * 60 + date.getMinutes();
	const rounded = Math.round(minutes / 30) * 30;
	return Math.min(rounded, 23 * 60 + 30);
}

function getLocalParts(date, timeZone) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}).formatToParts(date);

	const get = (type) =>
		parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute'),
	};
}

function createZoneId() {
	return `zone-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function MeetingPlanner() {
	const [userTimezone, setUserTimezone] = useState(
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
	);
	const [zones, setZones] = useState([]);
	const [sliderMinutes, setSliderMinutes] = useState(() =>
		roundToNearest30Minutes(new Date()),
	);
	const [activePicker, setActivePicker] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const addPickerRef = useRef(null);
	const localPickerRef = useRef(null);
	const searchInputRef = useRef(null);

	const timeFormatterCache = useRef(new Map());

	const formatTimeInZone = useCallback((date, timeZone) => {
		if (!timeFormatterCache.current.has(timeZone)) {
			timeFormatterCache.current.set(
				timeZone,
				new Intl.DateTimeFormat('en-US', {
					timeZone,
					hour: 'numeric',
					minute: '2-digit',
					hour12: true,
				}),
			);
		}
		return timeFormatterCache.current.get(timeZone).format(date);
	}, []);

	useEffect(() => {
		const localCity = findCityForTimezone(userTimezone);
		setZones([
			{
				id: 'local',
				timezone: userTimezone,
				city: localCity.city,
				country: localCity.country,
				flag: localCity.flag,
				isLocal: true,
			},
		]);
	}, [userTimezone]);

	useEffect(() => {
		if (!activePicker) return;

		const handleClickOutside = (event) => {
			const inAdd = addPickerRef.current?.contains(event.target);
			const inLocal = localPickerRef.current?.contains(event.target);
			if (!inAdd && !inLocal) {
				setActivePicker(null);
				setSearchQuery('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [activePicker]);

	useEffect(() => {
		if (activePicker && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [activePicker]);

	const selectedInstant = useMemo(() => {
		const now = new Date();
		const local = getLocalParts(now, userTimezone);
		const hour = Math.floor(sliderMinutes / 60);
		const minute = sliderMinutes % 60;
		return wallClockToUtc(
			local.year,
			local.month,
			local.day,
			hour,
			minute,
			userTimezone,
		);
	}, [sliderMinutes, userTimezone]);

	const usedTimezones = useMemo(
		() => new Set(zones.map((z) => z.timezone)),
		[zones],
	);

	const filteredCities = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return sortedCities.slice(0, 50);
		return sortedCities
			.filter(
				(c) =>
					c.city.toLowerCase().includes(q) ||
					c.country.toLowerCase().includes(q) ||
					c.timezone.toLowerCase().includes(q),
			)
			.slice(0, 50);
	}, [searchQuery]);

	const addZone = useCallback(
		(city) => {
			if (zones.length >= MAX_ZONES) return;
			if (usedTimezones.has(city.timezone)) return;
			setZones((prev) => [
				...prev,
				{
					id: createZoneId(),
					timezone: city.timezone,
					city: city.city,
					country: city.country,
					flag: city.flag,
					isLocal: false,
				},
			]);
			setActivePicker(null);
			setSearchQuery('');
		},
		[zones.length, usedTimezones],
	);

	const updateLocalZone = useCallback((city) => {
		setUserTimezone(city.timezone);
		setZones((prev) =>
			prev.map((z) =>
				z.isLocal
					? {
							...z,
							timezone: city.timezone,
							city: city.city,
							country: city.country,
							flag: city.flag,
						}
					: z,
			),
		);
		setActivePicker(null);
		setSearchQuery('');
	}, []);

	const isCityDisabledForLocal = useCallback(
		(city) => {
			const localZone = zones.find((z) => z.isLocal);
			if (!localZone) return false;
			if (city.timezone === localZone.timezone) return false;
			return zones.some((z) => !z.isLocal && z.timezone === city.timezone);
		},
		[zones],
	);

	const removeZone = useCallback((id) => {
		setZones((prev) => prev.filter((z) => z.id !== id || z.isLocal));
	}, []);

	const formatSliderLabel = (minutes) => {
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		const period = h >= 12 ? 'PM' : 'AM';
		const hour12 = h % 12 === 0 ? 12 : h % 12;
		return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
	};

	const renderCityPicker = (mode, onSelect, isDisabled) => (
		<div className="mp-picker">
			<input
				ref={searchInputRef}
				type="search"
				className="mp-picker-search"
				placeholder="Search 250+ cities…"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				autoComplete="off"
			/>
			<ul className="mp-picker-list" role="listbox">
				{filteredCities.length === 0 ? (
					<li className="mp-picker-empty">No cities found</li>
				) : (
					filteredCities.map((city) => {
						const disabled = isDisabled(city);
						return (
							<li key={`${mode}-${city.city}-${city.timezone}`}>
								<button
									type="button"
									className="mp-picker-item"
									disabled={disabled}
									onClick={() => onSelect(city)}
								>
									<span>
										{city.flag} {city.city}, {city.country}
									</span>
									{disabled && (
										<span className="mp-picker-added">Added</span>
									)}
								</button>
							</li>
						);
					})
				)}
			</ul>
		</div>
	);

	return (
		<div className="mp-tool">
			<div className="mp-slider-section">
				<div className="mp-slider-header">
					<span className="mp-slider-label">Your time</span>
					<span className="mp-slider-value">{formatSliderLabel(sliderMinutes)}</span>
				</div>
				<div className="mp-slider-track-wrap">
					<div className="mp-slider-ticks" aria-hidden="true">
						{[0, 6, 12, 18, 24].map((h) => (
							<span
								key={h}
								className="mp-slider-tick"
								style={{ left: `${(h / 24) * 100}%` }}
							>
								{h === 24 ? '00' : String(h).padStart(2, '0')}
							</span>
						))}
					</div>
					<input
						type="range"
						className="mp-slider"
						min={0}
						max={24 * 60 - 1}
						step={30}
						value={sliderMinutes}
						onChange={(e) => setSliderMinutes(Number(e.target.value))}
						aria-label="Select time of day in your time zone"
					/>
				</div>
			</div>

			<div className="mp-rows">
				{zones.map((zone) => {
					const parts = getLocalParts(selectedInstant, zone.timezone);
					const markerPercent =
						((parts.hour * 60 + parts.minute) / (24 * 60)) * 100;
					const displayTime = formatTimeInZone(selectedInstant, zone.timezone);

					return (
						<div key={zone.id} className="mp-row">
							<div className="mp-row-header">
								<div className="mp-row-info">
									{zone.isLocal && (
										<span className="mp-row-badge">Your time zone</span>
									)}
									{zone.isLocal ? (
										<div
											className="mp-add-wrap"
											ref={localPickerRef}
											style={{ position: 'relative' }}
										>
											<button
												type="button"
												className="mp-row-city"
												style={{
													background: 'none',
													border: 'none',
													padding: 0,
													cursor: 'pointer',
													textAlign: 'left',
												}}
												onClick={() => {
													setActivePicker((current) =>
														current === 'local' ? null : 'local',
													);
													setSearchQuery('');
												}}
												aria-expanded={activePicker === 'local'}
											>
												{zone.flag} {zone.city}
												{zone.country ? `, ${zone.country}` : ''}
											</button>
											{activePicker === 'local' &&
												renderCityPicker(
													'local',
													updateLocalZone,
													isCityDisabledForLocal,
												)}
										</div>
									) : (
										<span className="mp-row-city">
											{zone.flag} {zone.city}
											{zone.country ? `, ${zone.country}` : ''}
										</span>
									)}
								</div>
								{!zone.isLocal && (
									<button
										type="button"
										className="mp-remove"
										onClick={() => removeZone(zone.id)}
										aria-label={`Remove ${zone.city}`}
									>
										×
									</button>
								)}
							</div>

							<div className="mp-timeline-wrap">
								<div className="mp-timeline" aria-hidden="true">
									{Array.from({ length: 24 }, (_, hour) => (
										<div
											key={hour}
											className="mp-hour-block"
											style={{ background: hourBlockColor(hour) }}
											title={`${String(hour).padStart(2, '0')}:00`}
										/>
									))}
									<div
										className="mp-marker"
										style={{ left: `${markerPercent}%` }}
									/>
								</div>
								<div className="mp-time-display">{displayTime}</div>
							</div>
						</div>
					);
				})}
			</div>

			{zones.length < MAX_ZONES && (
				<div className="mp-add-wrap" ref={addPickerRef}>
					<button
						type="button"
						className="mp-add-btn"
						onClick={() => {
							setActivePicker((current) =>
								current === 'add' ? null : 'add',
							);
							setSearchQuery('');
						}}
						aria-expanded={activePicker === 'add'}
					>
						+ Add a time zone
					</button>

					{activePicker === 'add' &&
						renderCityPicker(
							'add',
							addZone,
							(city) => usedTimezones.has(city.timezone),
						)}
				</div>
			)}

			<div className="mp-legend">
				<span className="mp-legend-item">
					<span
						className="mp-legend-swatch"
						style={{ background: GOOD_COLOR, border: `1px solid ${GOOD_COLOR}` }}
					/>
					Good time (9 AM – 5 PM)
				</span>
				<span className="mp-legend-item">
					<span
						className="mp-legend-swatch"
						style={{ background: OKAY_COLOR, border: `1px solid ${OKAY_COLOR}` }}
					/>
					Okay (7–9 AM, 5–8 PM)
				</span>
				<span className="mp-legend-item">
					<span
						className="mp-legend-swatch"
						style={{ background: BAD_COLOR, border: `1px solid ${BAD_COLOR}` }}
					/>
					Off hours
				</span>
			</div>
			<style>{contrastStyles}</style>
		</div>
	);
}
