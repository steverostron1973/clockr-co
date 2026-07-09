import { allWorldClockCities } from '../data/worldClockSearchCities';
import timezoneCityFacts from '../data/timezoneCityFacts.json';

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

/** Curated ~45 major cities for static /timezone/[pair] pages (not the full dropdown list). */
const timezonePairCitySlugs = new Set([
	...anchorCitySlugs,
	'anchorage',
	'amsterdam',
	'auckland',
	'bangkok',
	'brisbane',
	'buenos-aires',
	'cairo',
	'delhi',
	'denver',
	'dublin',
	'honolulu',
	'istanbul',
	'jakarta',
	'johannesburg',
	'lagos',
	'madrid',
	'manila',
	'melbourne',
	'mexico-city',
	'miami',
	'nairobi',
	'reykjavik',
	'riyadh',
	'rome',
	'sao-paulo',
	'seoul',
	'shanghai',
	'taipei',
	'vancouver',
	'washington-dc',
]);

const cityFactTemplates = [
	(name, country) => `${name} is a major city in ${country}.`,
	(name, country) =>
		`A key urban centre in ${country}, ${name} is widely used for international time coordination.`,
	(name, country) =>
		`${name} serves as an important hub in ${country} for business, travel, and regional connections.`,
	(name, country) =>
		`Located in ${country}, ${name} is a well-known destination for global travellers and remote teams.`,
	(name, country) => `${name} is one of the principal cities in ${country}.`,
] as const;

export function slugifyCityName(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function hashSlug(slug: string): number {
	let hash = 0;
	for (let i = 0; i < slug.length; i++) {
		hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
	}
	return hash;
}

function getCityFact(name: string, country: string, slug: string): string {
	const curatedFact = timezoneCityFacts[slug as keyof typeof timezoneCityFacts];
	if (curatedFact) {
		return curatedFact;
	}

	const template =
		cityFactTemplates[hashSlug(slug) % cityFactTemplates.length];
	return template(name, country);
}

function buildTimezoneCities(): TimezoneCity[] {
	return allWorldClockCities
		.filter((city) => timezonePairCitySlugs.has(slugifyCityName(city.city)))
		.map((city) => {
			const slug = slugifyCityName(city.city);
			return {
				slug,
				name: city.city,
				country: city.country,
				timezone: city.timezone,
				fact: getCityFact(city.city, city.country, slug),
			};
		});
}

export const timezoneCities: TimezoneCity[] = buildTimezoneCities();

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
