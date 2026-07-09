import timezoneCitiesData from '../data/timezoneCities.json';

export interface TimezoneCity {
	slug: string;
	name: string;
	country: string;
	timezone: string;
	fact: string;
}

export interface TimezoneCityPair {
	slug: string;
	from: TimezoneCity;
	to: TimezoneCity;
}

export const timezoneCities: TimezoneCity[] = timezoneCitiesData;

export const anchorCitySlugs = new Set([
	'new-york',
	'london',
	'los-angeles',
	'tokyo',
	'sydney',
	'dubai',
	'singapore',
	'paris',
	'berlin',
	'toronto',
	'mumbai',
	'hong-kong',
	'chicago',
	'moscow',
	'beijing',
]);

const cityBySlug = new Map(
	timezoneCities.map((city) => [city.slug, city] as const),
);

export function getCityBySlug(slug: string): TimezoneCity | undefined {
	return cityBySlug.get(slug);
}

/** Canonical anchor-city pairs: alphabetical slug order, at least one anchor per pair. */
export function generateTimezonePairs(): TimezoneCityPair[] {
	const pairs: TimezoneCityPair[] = [];

	for (let i = 0; i < timezoneCities.length; i++) {
		for (let j = i + 1; j < timezoneCities.length; j++) {
			const a = timezoneCities[i];
			const b = timezoneCities[j];

			if (!anchorCitySlugs.has(a.slug) && !anchorCitySlugs.has(b.slug)) {
				continue;
			}

			const [from, to] = a.slug < b.slug ? [a, b] : [b, a];
			pairs.push({
				slug: `${from.slug}-to-${to.slug}`,
				from,
				to,
			});
		}
	}

	return pairs.sort((left, right) => left.slug.localeCompare(right.slug));
}

export const timezonePairs = generateTimezonePairs();

export function parsePairSlug(
	pairSlug: string,
): { from: TimezoneCity; to: TimezoneCity } | null {
	const match = timezonePairs.find((pair) => pair.slug === pairSlug);
	return match ? { from: match.from, to: match.to } : null;
}

export function getRelatedTimezonePairs(
	currentSlug: string,
	fromSlug: string,
	toSlug: string,
	limit = 6,
): TimezoneCityPair[] {
	const related = timezonePairs.filter((pair) => {
		if (pair.slug === currentSlug) return false;
		return (
			pair.from.slug === fromSlug ||
			pair.to.slug === fromSlug ||
			pair.from.slug === toSlug ||
			pair.to.slug === toSlug
		);
	});

	related.sort((left, right) => {
		const leftScore =
			(anchorCitySlugs.has(left.from.slug) ? 1 : 0) +
			(anchorCitySlugs.has(left.to.slug) ? 1 : 0);
		const rightScore =
			(anchorCitySlugs.has(right.from.slug) ? 1 : 0) +
			(anchorCitySlugs.has(right.to.slug) ? 1 : 0);
		if (rightScore !== leftScore) return rightScore - leftScore;
		return left.slug.localeCompare(right.slug);
	});

	return related.slice(0, limit);
}
