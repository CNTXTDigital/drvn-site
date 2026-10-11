// The five DRVN content territories. Learn (/learn/) has one section per territory:
// a question heading, a short explanation, one featured article and two supporting links.
// Every article's frontmatter sets `territory:` to one of these ids; the article page shows
// the label (linking to /learn/#id) and recommends more from the same territory.
// The home page cards use id, tag, q, short and img.

export const AREAS = [
  {
    id: 'readiness', n: 1, tag: 'Readiness', label: 'Readiness', q: 'Is my teen ready to drive alone?',
    short: 'How to judge real readiness, not just legal eligibility.',
    blurb: 'The state decides when they’re eligible. You decide when they’re ready. Learn what readiness actually looks like, how much coaching is still too much, and what passing the test does and does not prove.',
    img: '/images/learn/readiness.jpg', alt: 'A handwritten practice-driving log and car keys on the passenger seat at dusk.',
    article: 'is-my-teen-ready-to-drive-alone',
    links: ['50-hour-myth-driving-practice', 'teen-road-test-day'],
    callout: { k: 'A useful readiness test', t: 'How much of the driving are you still doing from the passenger seat?' },
  },
  {
    id: 'practice', n: 2, tag: 'Practice', label: 'Practice', q: 'What should we actually practice?',
    short: 'Build experience across the six driving environments.',
    blurb: 'Coverage matters as much as hours. Learn which roads, conditions, situations and skills your teen should experience before they start driving alone.',
    img: '/images/learn/practice.jpg', alt: 'A long, straight rural two-lane road between fields and trees.',
    article: 'six-driving-environments-teen-practice',
    links: ['teen-night-driving', 'teaching-highway-merging'],
  },
  {
    id: 'risk', n: 3, tag: 'Risk', label: 'Risk', q: 'What makes new drivers risky?',
    short: 'Where crashes happen, and why the first months alone matter most.',
    blurb: 'The most dangerous period begins when supervision ends. Understand the situations that increase crash risk and what parents can do before and after licensure.',
    img: '/images/learn/risk.jpg', alt: 'Heavy rain on a windshield at night, with taillights on the wet highway ahead.',
    article: 'most-dangerous-thing-teen-drivers-license',
    links: ['first-six-months-teen-driver', 'teen-driving-phones-distraction'],
  },
  {
    id: 'permit-year', n: 4, tag: 'The Permit Year', label: 'The Permit Year', q: 'What should the permit year look like?',
    short: 'Turn months of supervised driving into a deliberate progression.',
    blurb: 'Use the learner period as a progression, not a countdown. Start simple, add complexity deliberately, and reduce coaching as judgment develops.',
    img: '/images/learn/permit-year.jpg', alt: 'A parent marking practice drives on a year-at-a-glance calendar.',
    article: 'permit-year-practice-plan',
    links: ['teen-first-drive', 'driving-feedback-without-a-fight'],
  },
  {
    id: 'rules-costs', n: 5, tag: 'Rules & Costs', label: 'Rules & Costs', q: 'What are the rules and costs?',
    short: 'Licensing, insurance, driver’s ed and the decisions around a new driver.',
    blurb: 'Understand what the state requires, what driver’s ed covers, what insurance changes, and where legal minimums stop short of readiness.',
    img: '/images/learn/rules-costs.jpg', alt: 'A parent at the kitchen table with an insurance statement and car keys.',
    article: 'teen-driver-liability-limits',
    links: ['what-a-teen-driver-costs', 'is-drivers-ed-enough'],
  },
];

export const TERRITORY = Object.fromEntries(AREAS.map((a) => [a.id, a]));

// "Most useful right now" on Learn: three broadly useful articles.
export const MOST_USEFUL = ['teen-first-drive', 'first-six-months-teen-driver', 'driving-feedback-without-a-fight'];
