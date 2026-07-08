import { useEffect, useMemo, useState } from 'react';
import {
	findBandForOffset,
	formatCityDate,
	formatCityTime,
	formatWallClockAtOffset,
	formatWallDateAtOffset,
	getCitiesAtOffset,
	getTimezoneOffsetMinutes,
	TIMEZONE_MAP_BANDS,
} from '../data/timezoneMapBands';
import { findCityForTimezone } from '../utils/timezoneHelpers';

export default function TimezoneMapStrip() {
	const [now, setNow] = useState(() => new Date());
	const [selectedOffset, setSelectedOffset] = useState(null);

	const userTimezone = useMemo(
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
		[],
	);

	const userCity = useMemo(
		() => findCityForTimezone(userTimezone),
		[userTimezone],
	);

	const userOffsetMinutes = useMemo(
		() => getTimezoneOffsetMinutes(userTimezone, now),
		[userTimezone, now],
	);

	const userBand = useMemo(
		() => findBandForOffset(userOffsetMinutes),
		[userOffsetMinutes],
	);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	useEffect(() => {
		if (selectedOffset === null && userOffsetMinutes !== null) {
			setSelectedOffset(userOffsetMinutes);
		}
	}, [userOffsetMinutes, selectedOffset]);

	const selectedBand = useMemo(
		() =>
			selectedOffset !== null ? findBandForOffset(selectedOffset) : undefined,
		[selectedOffset],
	);

	const selectedBandCities = useMemo(
		() =>
			selectedOffset !== null ? getCitiesAtOffset(selectedOffset, now) : [],
		[selectedOffset, now],
	);

	function handleBandClick(offsetMinutes) {
		setSelectedOffset((prev) =>
			prev === offsetMinutes ? null : offsetMinutes,
		);
	}

	return (
		<div className="tzm-tool">
			<div className="tzm-user-banner" aria-live="polite">
				<span className="tzm-user-label">Your time zone</span>
				<span className="tzm-user-location">
					{userCity.flag} {userCity.city}
					{userCity.country ? `, ${userCity.country}` : ''}
				</span>
				<span className="tzm-user-time">
					{formatCityTime(now, userTimezone)}
				</span>
				<span className="tzm-user-offset">
					{userBand?.label ?? `UTC${userOffsetMinutes >= 0 ? '+' : '−'}${Math.abs(userOffsetMinutes / 60)}`}
				</span>
			</div>

			<p className="tzm-hint">
				Scroll the strip and tap a zone for cities and live times. Your current
				offset is highlighted.
			</p>

			<div className="tzm-strip-wrap" role="list" aria-label="UTC offset bands">
				<div className="tzm-strip">
					{TIMEZONE_MAP_BANDS.map((band) => {
						const isUser = band.offsetMinutes === userOffsetMinutes;
						const isSelected = band.offsetMinutes === selectedOffset;
						const bandCities = getCitiesAtOffset(band.offsetMinutes, now);
						const previewCities = bandCities
							.slice(0, 2)
							.map((c) => c.name)
							.join(', ');

						return (
							<button
								key={band.offsetMinutes}
								type="button"
								role="listitem"
								className={`tzm-band${isUser ? ' tzm-band--user' : ''}${isSelected ? ' tzm-band--selected' : ''}`}
								onClick={() => handleBandClick(band.offsetMinutes)}
								aria-pressed={isSelected}
								aria-label={`${band.label}, ${previewCities}`}
							>
								{isUser && (
									<span className="tzm-band-you" aria-hidden="true">
										You
									</span>
								)}
								<span className="tzm-band-offset">{band.label}</span>
								<span className="tzm-band-time">
									{formatWallClockAtOffset(now, band.offsetMinutes)}
								</span>
								<span className="tzm-band-cities">{previewCities}</span>
							</button>
						);
					})}
				</div>
			</div>

			{selectedBand && (
				<section
					className="tzm-detail"
					aria-label={`Details for ${selectedBand.label}`}
				>
					<div className="tzm-detail-header">
						<h2 className="tzm-detail-title">{selectedBand.label}</h2>
						<p className="tzm-detail-regions">{selectedBand.regions}</p>
						<p className="tzm-detail-now">
							<span className="tzm-detail-clock">
								{formatWallClockAtOffset(now, selectedBand.offsetMinutes)}
							</span>
							<span className="tzm-detail-date">
								{formatWallDateAtOffset(now, selectedBand.offsetMinutes)}
							</span>
						</p>
					</div>

					<ul className="tzm-detail-cities">
						{selectedBandCities.map((city) => (
							<li
								key={`${city.timezone}-${city.name}`}
								className={`tzm-detail-city${city.timezone === userTimezone ? ' tzm-detail-city--user' : ''}`}
							>
								<div className="tzm-detail-city-top">
									<span className="tzm-detail-flag" aria-hidden="true">
										{city.flag}
									</span>
									<div>
										<div className="tzm-detail-city-name">{city.name}</div>
										<div className="tzm-detail-city-country">{city.country}</div>
									</div>
									{city.timezone === userTimezone && (
										<span className="tzm-detail-you-badge">Your zone</span>
									)}
								</div>
								<div className="tzm-detail-city-time">
									{formatCityTime(now, city.timezone)}
								</div>
								<div className="tzm-detail-city-date">
									{formatCityDate(now, city.timezone)}
								</div>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}
