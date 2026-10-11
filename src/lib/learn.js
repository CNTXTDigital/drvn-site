// The five Learn areas (home page cards + /learn/ rows). Each points to a published
// article and to sections of the parent guide (/teen-driving-safety/#…).
const G = (id) => `/teen-driving-safety/#${id}`;

export const AREAS = [
  {
    id: 'readiness', n: 1, tag: 'Readiness', q: 'Is my teen ready to drive alone?',
    short: 'How to judge real readiness, not just legal eligibility.',
    blurb: 'The state decides when they’re eligible. You decide when they’re ready. Here’s how to tell.',
    img: '/images/learn/readiness.jpg', alt: 'A handwritten practice-driving log and car keys on the passenger seat at dusk.',
    article: '50-hour-myth-driving-practice',
    more: [
      { t: 'How do I know they’re ready to drive alone?', k: 'Guide', href: G('ready-to-drive-alone') },
      { t: 'Doesn’t passing the road test prove they’re ready?', k: 'Guide', href: G('road-test') },
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
      { t: 'What skills matter most?', k: 'Guide', href: G('skills-that-matter') },
    ],
  },
  {
    id: 'risk', n: 3, tag: 'Risk', q: 'What makes new drivers risky?',
    short: 'Where crashes happen, and why the first months alone matter most.',
    blurb: 'Why the dangerous day isn’t the first lesson. It’s the first drive without you.',
    img: '/images/learn/risk.jpg', alt: 'Heavy rain on a windshield at night, with taillights on the wet highway ahead.',
    article: 'most-dangerous-thing-teen-drivers-license',
    more: [
      { t: 'When is a new driver most at risk?', k: 'Guide', href: G('when-risk-is-highest') },
      { t: 'Passengers, night driving and phones', k: 'Guide', href: G('teen-passengers') },
    ],
  },
  {
    id: 'permit-year', n: 4, tag: 'The permit year', q: 'What should the permit year look like?',
    short: 'Turn months of supervised driving into a deliberate progression.',
    blurb: 'Turn twelve months of supervised driving into a deliberate progression, not a pile of miles.',
    img: '/images/learn/permit-year.jpg', alt: 'A parent marking practice drives on a year-at-a-glance calendar.',
    article: 'permit-year-practice-plan',
    more: [
      { t: 'Should we follow the state minimum or go beyond it?', k: 'Guide', href: G('state-minimum') },
      { t: 'What if practicing together turns into a fight?', k: 'Guide', href: G('conflict') },
    ],
  },
  {
    id: 'rules-costs', n: 5, tag: 'Rules & costs', q: 'What are the rules and costs?',
    short: 'Licensing, insurance, driver’s ed and the decisions around a new driver.',
    blurb: 'Licensing, insurance and driver’s ed, and what each one does and doesn’t cover.',
    img: '/images/learn/rules-costs.jpg', alt: 'A parent at the kitchen table with an insurance statement and car keys.',
    article: 'what-a-teen-driver-costs',
    more: [
      { t: 'Is driver’s ed enough?', k: 'Guide', href: G('is-drivers-ed-enough') },
      { t: 'A parent-teen driving agreement', k: 'Guide', href: G('driving-agreement') },
      { t: 'Your state’s requirements', k: 'State guide', href: '/guide/' },
    ],
  },
];
