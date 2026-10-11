// The five Learn areas (home page cards + /learn/ rows). Each points to a published
// article and to sections of the parent guide (/teen-driving-safety/#…).
const G = (id) => `/teen-driving-safety/#${id}`;

export const AREAS = [
  {
    id: 'readiness', n: 1, tag: 'Readiness', q: 'Is my teen ready to drive alone?',
    short: 'How to judge real readiness, not just legal eligibility.',
    blurb: 'The state decides when they’re eligible. You decide when they’re ready. Here’s how to tell.',
    img: '/images/learn/readiness.jpg', alt: 'A handwritten practice-driving log and car keys on the passenger seat at dusk.',
    article: 'is-my-teen-ready-to-drive-alone',
    more: [
      { t: 'Road Test Day: what the test proves, and what it doesn’t', k: 'Article', href: '/teen-road-test-day/' },
      { t: 'The 50-Hour Myth', k: 'Article', href: '/50-hour-myth-driving-practice/' },
      { t: 'Staying involved after the license', k: 'Article', href: '/staying-involved-after-the-license/' },
      { t: 'The first car question', k: 'Article', href: '/choosing-a-car-for-a-teen-driver/' },
      { t: 'The first fender bender', k: 'Article', href: '/teen-first-fender-bender/' },
      { t: 'Their first ticket', k: 'Article', href: '/teen-first-traffic-ticket/' },
      { t: 'A quick readiness check', k: 'Checklist', href: G('readiness-check') },
    ],
  },
  {
    id: 'practice', n: 2, tag: 'Practice', q: 'What should we practice?',
    short: 'Build experience across the six driving environments.',
    blurb: 'Coverage, not just hours: the roads and conditions a new driver needs before going solo.',
    img: '/images/learn/practice.jpg', alt: 'A long, straight rural two-lane road between fields and trees.',
    article: 'six-driving-environments-teen-practice',
    more: [
      { t: 'Rain, Snow and Ice on Purpose', k: 'Article', href: '/weather-driving-practice/' },
      { t: 'How do I teach without becoming an instructor?', k: 'Guide', href: G('how-to-teach') },
      { t: 'Left turns', k: 'Article', href: '/teaching-left-turns/' },
      { t: 'Highway merging', k: 'Article', href: '/teaching-highway-merging/' },
      { t: 'Following distance', k: 'Article', href: '/following-distance-teen-drivers/' },
      { t: 'Skids, blowouts and brake failure', k: 'Article', href: '/skids-blowouts-brake-failure/' },
    ],
  },
  {
    id: 'risk', n: 3, tag: 'Risk', q: 'What makes new drivers risky?',
    short: 'Where crashes happen, and why the first months alone matter most.',
    blurb: 'Why the dangerous day isn’t the first lesson. It’s the first drive without you.',
    img: '/images/learn/risk.jpg', alt: 'Heavy rain on a windshield at night, with taillights on the wet highway ahead.',
    article: 'most-dangerous-thing-teen-drivers-license',
    more: [
      { t: 'The First Six Months Alone', k: 'Article', href: '/first-six-months-teen-driver/' },
      { t: 'The Friend in the Passenger Seat', k: 'Article', href: '/teen-driver-passengers/' },
      { t: 'Night Driving', k: 'Article', href: '/teen-night-driving/' },
      { t: 'Phones and Distraction', k: 'Article', href: '/teen-driving-phones-distraction/' },
    ],
  },
  {
    id: 'permit-year', n: 4, tag: 'The permit year', q: 'What should the permit year look like?',
    short: 'Turn months of supervised driving into a deliberate progression.',
    blurb: 'Turn twelve months of supervised driving into a deliberate progression, not a pile of miles.',
    img: '/images/learn/permit-year.jpg', alt: 'A parent marking practice drives on a year-at-a-glance calendar.',
    article: 'permit-year-practice-plan',
    more: [
      { t: 'The First Drive: What to Do on Day One', k: 'Article', href: '/teen-first-drive/' },
      { t: 'What if practicing together turns into a fight?', k: 'Article', href: '/driving-feedback-without-a-fight/' },
      { t: 'Should we follow the state minimum or go beyond it?', k: 'Guide', href: G('state-minimum') },
    ],
  },
  {
    id: 'rules-costs', n: 5, tag: 'Rules & costs', q: 'What are the rules and costs?',
    short: 'Licensing, insurance, driver’s ed and the decisions around a new driver.',
    blurb: 'Licensing, insurance and driver’s ed, and what each one does and doesn’t cover.',
    img: '/images/learn/rules-costs.jpg', alt: 'A parent at the kitchen table with an insurance statement and car keys.',
    article: 'what-a-teen-driver-costs',
    more: [
      { t: 'Is driver’s ed enough?', k: 'Article', href: '/is-drivers-ed-enough/' },
      { t: 'How to choose a driver’s ed course', k: 'Article', href: '/choosing-a-drivers-ed-course/' },
      { t: 'The parent-teen driving agreement (free PDF)', k: 'Article', href: '/parent-teen-driving-agreement/' },
      { t: 'Compare teen driving laws in all 50 states', k: 'Reference', href: '/teen-driving-laws-by-state/' },
    ],
  },
];
