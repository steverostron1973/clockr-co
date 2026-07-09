import { allWorldClockCities } from '../data/worldClockSearchCities';
import {
	getTimezoneCityFact,
	slugifyCityName,
} from './timezoneCityPairs';

export interface CurrentTimeCity {
	slug: string;
	name: string;
	country: string;
	timezone: string;
	flag: string;
	lat: number;
	lng: number;
	fact: string;
}

function buildCurrentTimeCities(): CurrentTimeCity[] {
	return allWorldClockCities.map((city) => {
		const slug = slugifyCityName(city.city);
		return {
			slug,
			name: city.city,
			country: city.country,
			timezone: city.timezone,
			flag: city.flag,
			lat: city.lat,
			lng: city.lng,
			fact: getTimezoneCityFact(city.city, city.country, slug),
		};
	});
}

export const currentTimeCities: CurrentTimeCity[] = buildCurrentTimeCities();

const cityBySlug = new Map(
	currentTimeCities.map((city) => [city.slug, city] as const),
);

export function getCurrentTimeCityBySlug(
	slug: string,
): CurrentTimeCity | undefined {
	return cityBySlug.get(slug);
}
