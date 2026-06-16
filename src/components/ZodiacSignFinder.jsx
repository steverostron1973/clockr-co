import { useMemo, useState } from 'react';

function parseInputValue(value) {
	if (!value) return null;
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return null;
	const d = new Date(year, month - 1, day);
	if (Number.isNaN(d.getTime())) return null;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toInputValue(d) {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

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

const BIRTHSTONES = [
	'Garnet',
	'Amethyst',
	'Aquamarine',
	'Diamond',
	'Emerald',
	'Pearl',
	'Ruby',
	'Peridot',
	'Sapphire',
	'Opal',
	'Topaz',
	'Turquoise',
];

const ZODIAC_SIGNS = [
	{
		name: 'Capricorn',
		symbol: '♑',
		start: [12, 22],
		end: [1, 19],
		element: 'Earth',
		planet: 'Saturn',
		traits: ['Ambitious', 'Disciplined', 'Patient', 'Practical'],
		demo: [1, 5],
		symbolMeaning:
			'The Sea-Goat — representing ambition, perseverance, and the climb toward lasting achievement',
		luckyNumbers: [4, 8, 13],
		luckyColors: [
			{ name: 'Brown', hex: '#795548' },
			{ name: 'Black', hex: '#263238' },
		],
		compatibleSigns: ['Taurus', 'Virgo', 'Scorpio'],
		famousPeople: ['Michelle Obama', 'Martin Luther King Jr.', 'Dolly Parton'],
		vibe: 'Capricorns tend to play the long game — building careers, relationships, and routines that stand the test of time. There is a quiet seriousness about them, but also dry wit and deep loyalty once you earn their trust. They find satisfaction in tangible progress and rarely chase shortcuts.',
	},
	{
		name: 'Aquarius',
		symbol: '♒',
		start: [1, 20],
		end: [2, 18],
		element: 'Air',
		planet: 'Uranus',
		traits: ['Independent', 'Innovative', 'Humanitarian', 'Original'],
		demo: [2, 5],
		symbolMeaning:
			'The Water Bearer — representing knowledge, progress, and pouring ideas out for the benefit of others',
		luckyNumbers: [4, 7, 11],
		luckyColors: [
			{ name: 'Electric Blue', hex: '#00BCD4' },
			{ name: 'Violet', hex: '#7E57C2' },
		],
		compatibleSigns: ['Gemini', 'Libra', 'Sagittarius'],
		famousPeople: ['Oprah Winfrey', 'Cristiano Ronaldo', 'Abraham Lincoln'],
		vibe: 'Aquarians often think a step ahead of the crowd, drawn to ideas, causes, and friendships that feel meaningful rather than conventional. They value personal freedom and can seem detached, but they care deeply about people in their own unconventional way. Expect originality, strong opinions, and a mind that rarely stands still.',
	},
	{
		name: 'Pisces',
		symbol: '♓',
		start: [2, 19],
		end: [3, 20],
		element: 'Water',
		planet: 'Neptune',
		traits: ['Intuitive', 'Compassionate', 'Artistic', 'Dreamy'],
		demo: [3, 5],
		symbolMeaning:
			'The Fish — representing intuition, empathy, and flowing between the seen and unseen worlds',
		luckyNumbers: [3, 7, 12],
		luckyColors: [
			{ name: 'Sea Green', hex: '#26A69A' },
			{ name: 'Lavender', hex: '#B39DDB' },
		],
		compatibleSigns: ['Cancer', 'Scorpio', 'Capricorn'],
		famousPeople: ['Albert Einstein', 'Rihanna', 'Steve Jobs'],
		vibe: 'Pisces feel life deeply and often pick up on moods and subtleties others miss. They are drawn to music, art, and quiet moments of reflection, and they give generously of their time and empathy. Boundaries can be a challenge, but their imagination and kindness make them unforgettable companions.',
	},
	{
		name: 'Aries',
		symbol: '♈',
		start: [3, 21],
		end: [4, 19],
		element: 'Fire',
		planet: 'Mars',
		traits: ['Bold', 'Energetic', 'Confident', 'Pioneering'],
		demo: [4, 5],
		symbolMeaning:
			'The Ram — representing courage, initiative, and charging headfirst into new beginnings',
		luckyNumbers: [1, 9, 22],
		luckyColors: [
			{ name: 'Red', hex: '#E53935' },
			{ name: 'Scarlet', hex: '#FF1744' },
		],
		compatibleSigns: ['Leo', 'Sagittarius', 'Gemini'],
		famousPeople: ['Leonardo da Vinci', 'Lady Gaga', 'Robert Downey Jr.'],
		vibe: 'Aries bring a spark of momentum wherever they go — quick to start, quick to act, and rarely afraid of a challenge. They thrive on competition and fresh starts, and their enthusiasm can be genuinely infectious. Patience is not always their strength, but their honesty and drive usually win people over.',
	},
	{
		name: 'Taurus',
		symbol: '♉',
		start: [4, 20],
		end: [5, 20],
		element: 'Earth',
		planet: 'Venus',
		traits: ['Reliable', 'Patient', 'Devoted', 'Sensual'],
		demo: [5, 5],
		symbolMeaning:
			'The Bull — representing strength, stability, and quiet determination',
		luckyNumbers: [2, 6, 9],
		luckyColors: [
			{ name: 'Green', hex: '#4CAF50' },
			{ name: 'Pink', hex: '#F48FB1' },
		],
		compatibleSigns: ['Virgo', 'Capricorn', 'Cancer'],
		famousPeople: ['Adele', 'David Beckham', 'Queen Elizabeth II'],
		vibe: 'Taureans appreciate the good things in life — comfort, good food, beautiful spaces, and people they can count on. They move at their own steady pace and dislike being rushed, but their loyalty in love and friendship runs deep. Practical and grounded, they build security rather than chase drama.',
	},
	{
		name: 'Gemini',
		symbol: '♊',
		start: [5, 21],
		end: [6, 20],
		element: 'Air',
		planet: 'Mercury',
		traits: ['Curious', 'Adaptable', 'Witty', 'Expressive'],
		demo: [6, 5],
		symbolMeaning:
			'The Twins — representing duality, communication, and seeing every side of a story',
		luckyNumbers: [3, 5, 7],
		luckyColors: [
			{ name: 'Yellow', hex: '#FFEB3B' },
			{ name: 'Light Blue', hex: '#81D4FA' },
		],
		compatibleSigns: ['Libra', 'Aquarius', 'Aries'],
		famousPeople: ['Angelina Jolie', 'Kanye West', 'Johnny Depp'],
		vibe: 'Geminis live through conversation, ideas, and constant motion. They pick up new interests quickly, connect dots others miss, and keep social circles lively with humour and curiosity. Restlessness is part of the package — they need variety and mental stimulation to feel truly alive.',
	},
	{
		name: 'Cancer',
		symbol: '♋',
		start: [6, 21],
		end: [7, 22],
		element: 'Water',
		planet: 'Moon',
		traits: ['Intuitive', 'Emotional', 'Loyal', 'Protective'],
		demo: [7, 5],
		symbolMeaning:
			'The Crab — representing protection, emotional depth, and retreating into a safe shell when needed',
		luckyNumbers: [2, 7, 11],
		luckyColors: [
			{ name: 'White', hex: '#FAFAFA' },
			{ name: 'Silver', hex: '#B0BEC5' },
		],
		compatibleSigns: ['Scorpio', 'Pisces', 'Taurus'],
		famousPeople: ['Tom Hanks', 'Princess Diana', 'Nelson Mandela'],
		vibe: 'Cancers are the people who remember birthdays, check in when something feels off, and make a house feel like home. Their emotions run deep, and they protect the people they love fiercely. It can take time to get past their shell, but the warmth underneath is genuine and lasting.',
	},
	{
		name: 'Leo',
		symbol: '♌',
		start: [7, 23],
		end: [8, 22],
		element: 'Fire',
		planet: 'Sun',
		traits: ['Charismatic', 'Generous', 'Creative', 'Confident'],
		demo: [8, 5],
		symbolMeaning:
			'The Lion — representing courage, pride, and a natural flair for the spotlight',
		luckyNumbers: [1, 4, 10],
		luckyColors: [
			{ name: 'Gold', hex: '#FFD700' },
			{ name: 'Orange', hex: '#FF9800' },
		],
		compatibleSigns: ['Aries', 'Sagittarius', 'Gemini'],
		famousPeople: ['Barack Obama', 'Jennifer Lopez', 'Madonna'],
		vibe: 'Leos light up a room — not always because they seek attention, but because their warmth and confidence draw people in. They are generous with praise, fiercely loyal to their inner circle, and often creative in ways that surprise even themselves. Pride matters to them, but so does making the people they love feel celebrated.',
	},
	{
		name: 'Virgo',
		symbol: '♍',
		start: [8, 23],
		end: [9, 22],
		element: 'Earth',
		planet: 'Mercury',
		traits: ['Analytical', 'Practical', 'Diligent', 'Modest'],
		demo: [9, 5],
		symbolMeaning:
			'The Maiden — representing purity, careful analysis, and devotion to getting things right',
		luckyNumbers: [3, 5, 6],
		luckyColors: [
			{ name: 'Navy', hex: '#1A237E' },
			{ name: 'Grey', hex: '#78909C' },
		],
		compatibleSigns: ['Taurus', 'Capricorn', 'Cancer'],
		famousPeople: ['Beyoncé', 'Keanu Reeves', 'Warren Buffett'],
		vibe: 'Virgos notice what others overlook — the detail that is off, the process that could be smoother, the kind gesture that went unacknowledged. They take pride in being useful and reliable, even if they downplay their own contributions. Perfectionism can be a burden, but it comes from a genuine desire to improve things.',
	},
	{
		name: 'Libra',
		symbol: '♎',
		start: [9, 23],
		end: [10, 22],
		element: 'Air',
		planet: 'Venus',
		traits: ['Diplomatic', 'Fair', 'Social', 'Gracious'],
		demo: [10, 5],
		symbolMeaning:
			'The Scales — representing balance, justice, and the search for harmony in all things',
		luckyNumbers: [4, 6, 13],
		luckyColors: [
			{ name: 'Blue', hex: '#2196F3' },
			{ name: 'Pink', hex: '#F06292' },
		],
		compatibleSigns: ['Gemini', 'Aquarius', 'Leo'],
		famousPeople: ['Will Smith', 'Kim Kardashian', 'Serena Williams'],
		vibe: 'Libras have a gift for making situations feel fair and aesthetically pleasing — whether that means mediating a disagreement or choosing the perfect restaurant. They thrive in partnership and collaboration, and they genuinely dislike conflict. Charm comes naturally, but beneath it is a real commitment to equity and grace.',
	},
	{
		name: 'Scorpio',
		symbol: '♏',
		start: [10, 23],
		end: [11, 21],
		element: 'Water',
		planet: 'Pluto',
		traits: ['Passionate', 'Resourceful', 'Determined', 'Magnetic'],
		demo: [11, 5],
		symbolMeaning:
			'The Scorpion — representing intensity, transformation, and depth beneath the surface',
		luckyNumbers: [8, 11, 18],
		luckyColors: [
			{ name: 'Deep Red', hex: '#B71C1C' },
			{ name: 'Black', hex: '#212121' },
		],
		compatibleSigns: ['Cancer', 'Pisces', 'Capricorn'],
		famousPeople: ['Bill Gates', 'Julia Roberts', 'Leonardo DiCaprio'],
		vibe: 'Scorpios feel everything at full volume — loyalty, curiosity, jealousy, devotion — and they rarely do anything halfway. They are drawn to truth and authenticity, and they can sense when someone is holding back. Trust is everything; once you have it, their loyalty is extraordinary.',
	},
	{
		name: 'Sagittarius',
		symbol: '♐',
		start: [11, 22],
		end: [12, 21],
		element: 'Fire',
		planet: 'Jupiter',
		traits: ['Optimistic', 'Adventurous', 'Honest', 'Philosophical'],
		demo: [12, 5],
		symbolMeaning:
			'The Archer — representing aim, exploration, and shooting toward distant horizons',
		luckyNumbers: [3, 7, 9],
		luckyColors: [
			{ name: 'Purple', hex: '#9C27B0' },
			{ name: 'Blue', hex: '#3F51B5' },
		],
		compatibleSigns: ['Aries', 'Leo', 'Aquarius'],
		famousPeople: ['Brad Pitt', 'Taylor Swift', 'Walt Disney'],
		vibe: 'Sagittarians are happiest when there is somewhere new to go or something new to learn. Their honesty can be blunt, but it usually comes from optimism rather than cruelty — they believe things will work out and want everyone to feel that freedom too. Routine bores them; meaning, travel, and big ideas do not.',
	},
];

function formatRangePart(month, day) {
	return `${day} ${MONTH_NAMES[month - 1]}`;
}

function getDateRange(sign) {
	return `${formatRangePart(sign.start[0], sign.start[1])} – ${formatRangePart(sign.end[0], sign.end[1])}`;
}

function mdValue(month, day) {
	return month * 100 + day;
}

function getSignIndex(month, day) {
	const md = mdValue(month, day);
	for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
		const sign = ZODIAC_SIGNS[i];
		const startMd = mdValue(sign.start[0], sign.start[1]);
		const endMd = mdValue(sign.end[0], sign.end[1]);
		if (startMd > endMd) {
			if (md >= startMd || md <= endMd) return i;
		} else if (md >= startMd && md <= endMd) {
			return i;
		}
	}
	return 0;
}

function daysBetweenMd(fromMonth, fromDay, toMonth, toDay) {
	const from = mdValue(fromMonth, fromDay);
	const to = mdValue(toMonth, toDay);
	if (from <= to) return to - from;
	return to + 1200 - from;
}

function getCuspNote(signIndex, month, day) {
	const sign = ZODIAC_SIGNS[signIndex];
	const nextSign = ZODIAC_SIGNS[(signIndex + 1) % ZODIAC_SIGNS.length];
	const prevSign = ZODIAC_SIGNS[(signIndex - 1 + ZODIAC_SIGNS.length) % ZODIAC_SIGNS.length];

	const daysFromStart = daysBetweenMd(sign.start[0], sign.start[1], month, day);
	const daysToEnd = daysBetweenMd(month, day, sign.end[0], sign.end[1]);

	if (daysToEnd <= 1 && daysToEnd >= 0) {
		return `You were born close to the ${nextSign.name} cusp — some say this blends traits of both signs.`;
	}
	if (daysFromStart <= 1 && daysFromStart >= 0) {
		return `You were born close to the ${prevSign.name} cusp — some say this blends traits of both signs.`;
	}
	return null;
}

function getBirthstone(month) {
	return BIRTHSTONES[month - 1] ?? '';
}

const SIGN_BY_NAME = Object.fromEntries(ZODIAC_SIGNS.map((s) => [s.name, s]));

function demoDateForSign(sign) {
	const [month, day] = sign.demo;
	return new Date(2000, month - 1, day);
}

export default function ZodiacSignFinder() {
	const [dateValue, setDateValue] = useState('');

	const birthDate = useMemo(() => parseInputValue(dateValue), [dateValue]);

	const result = useMemo(() => {
		if (!birthDate) return null;
		const month = birthDate.getMonth() + 1;
		const day = birthDate.getDate();
		const signIndex = getSignIndex(month, day);
		const sign = ZODIAC_SIGNS[signIndex];
		return {
			sign,
			dateRange: getDateRange(sign),
			birthstone: getBirthstone(month),
			cuspNote: getCuspNote(signIndex, month, day),
			traitsText: sign.traits.join(', '),
		};
	}, [birthDate]);

	function selectSign(sign) {
		const demo = demoDateForSign(sign);
		setDateValue(toInputValue(demo));
	}

	return (
		<div className="zsf-tool">
			<div className="zsf-card">
				<style>{`
					#zsf-date-input {
						text-align: center;
					}
					#zsf-date-input::-webkit-datetime-edit,
					#zsf-date-input::-webkit-datetime-edit-fields-wrapper {
						display: flex;
						justify-content: center;
						width: 100%;
						text-align: center;
					}
					#zsf-date-input::-webkit-datetime-edit-day-field,
					#zsf-date-input::-webkit-datetime-edit-month-field,
					#zsf-date-input::-webkit-datetime-edit-year-field {
						text-align: center;
					}
				`}</style>
				<div className="zsf-input-wrap">
					<label className="zsf-label" htmlFor="zsf-date-input">
						Your birth date
					</label>
					<input
						id="zsf-date-input"
						type="date"
						className="zsf-input"
						value={dateValue}
						onChange={(e) => setDateValue(e.target.value)}
					/>
				</div>
			</div>

			{result && (
				<div className="zsf-results" aria-live="polite">
					<h2 className="zsf-sign-heading">
						<span className="zsf-sign-symbol">{result.sign.symbol}</span>{' '}
						<span className="zsf-sign-name">{result.sign.name}</span>
					</h2>
					<p className="zsf-date-range">{result.dateRange}</p>

					<div className="zsf-details">
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Element</span>
							<span className="zsf-detail-value">{result.sign.element}</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Ruling planet</span>
							<span className="zsf-detail-value">{result.sign.planet}</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Key traits</span>
							<span className="zsf-detail-value">{result.traitsText}</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Birthstone</span>
							<span className="zsf-detail-value">{result.birthstone}</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Symbol meaning</span>
							<span className="zsf-detail-value">{result.sign.symbolMeaning}</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Lucky numbers</span>
							<span className="zsf-detail-value">
								{result.sign.luckyNumbers.join(', ')}
							</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Lucky colours</span>
							<span className="zsf-detail-value">
								<span className="zsf-color-list">
									{result.sign.luckyColors.map((color) => (
										<span key={color.name} className="zsf-color-item">
											<span
												className="zsf-color-swatch"
												style={{ backgroundColor: color.hex }}
												aria-hidden="true"
											/>
											{color.name}
										</span>
									))}
								</span>
							</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Compatible signs</span>
							<span className="zsf-detail-value">
								<span className="zsf-compat-chips">
									{result.sign.compatibleSigns.map((name) => {
										const match = SIGN_BY_NAME[name];
										return (
											<span key={name} className="zsf-compat-chip">
												{match?.symbol} {name}
											</span>
										);
									})}
								</span>
							</span>
						</div>
						<div className="zsf-detail-row">
							<span className="zsf-detail-label">Famous people</span>
							<span className="zsf-detail-value">
								{result.sign.famousPeople.join(', ')}
							</span>
						</div>
					</div>

					<div className="zsf-vibe-card">
						<span className="zsf-detail-label">The vibe</span>
						<p className="zsf-vibe-text">{result.sign.vibe}</p>
					</div>

					{result.cuspNote && (
						<p className="zsf-cusp-note" role="note">
							{result.cuspNote}
						</p>
					)}
				</div>
			)}

			<section className="zsf-grid-section" aria-label="All 12 zodiac signs">
				<h2 className="zsf-grid-title">All 12 zodiac signs</h2>
				<div className="zsf-grid">
					{ZODIAC_SIGNS.map((sign) => (
						<button
							key={sign.name}
							type="button"
							className="zsf-grid-item"
							onClick={() => selectSign(sign)}
						>
							<span className="zsf-grid-symbol">{sign.symbol}</span>
							<span className="zsf-grid-name">{sign.name}</span>
							<span className="zsf-grid-range">{getDateRange(sign)}</span>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
