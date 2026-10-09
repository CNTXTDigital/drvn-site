// Site-wide settings. Change links here, not in templates.
export const SITE = {
  name: 'DRVN',
  url: 'https://www.drvnapp.com',
  tagline: 'The plan for parents teaching a teen to drive.',
  defaultDescription:
    'DRVN is the plan for parents teaching a teen to drive: one priority before each drive, hours and roads tracked while you drive, and a clear picture of what is still missing.',
  author: 'Robert Abbott',
  gtm: 'GTM-WBTWZH2',
  appStore: 'https://apps.apple.com/us/app/drvn/id1244075088',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.contextdigital.drvnpro',
  social: {
    facebook: 'https://www.facebook.com/drvnapp/',
    twitter: 'https://twitter.com/drvn_app',
    instagram: 'https://www.instagram.com/drvnapp/',
  },
};

export const POSTS_PER_PAGE = 5;

// Online driver's ed affiliate links (partner: Aceable). Use driversEdLink(state) everywhere
// so a state-specific offer is used when one exists and the general Aceable offer otherwise.
export const DRIVERS_ED = {
  default: { url: 'http://go.aceable.com/aff_c?offer_id=4&aff_id=1301', provider: 'Aceable', label: 'Online drivers ed course' },
  states: {
    texas: { url: 'http://go.aceable.com/aff_c?offer_id=17&aff_id=1301', provider: 'Aceable', label: 'Parent-taught teen drivers ed' },
    idaho: { url: 'http://go.driversed.com/aff_c?offer_id=368&aff_id=1301', provider: 'DriversEd.com', label: 'Teen drivers ed' },
    oklahoma: { url: 'http://go.aceable.com/aff_c?offer_id=366&aff_id=1301', provider: 'Aceable', label: 'Parent-taught teen drivers ed' },
    wisconsin: { url: 'http://go.driversed.com/aff_c?offer_id=369&aff_id=1301', provider: 'DriversEd.com', label: 'Teen drivers ed' },
    colorado: { url: 'http://go.driversed.com/aff_c?offer_id=367&aff_id=1301', provider: 'DriversEd.com', label: 'Teen drivers ed' },
    indiana: { url: 'http://go.driversed.com/aff_c?offer_id=33&aff_id=1301', provider: 'DriversEd.com', label: 'Teen drivers ed' },
    georgia: { url: 'http://go.aceable.com/aff_c?offer_id=9&aff_id=1301', provider: 'Aceable', label: 'Teen drivers ed' },
    ohio: { url: 'http://go.aceable.com/aff_c?offer_id=10&aff_id=1301', provider: 'Aceable', label: 'Teen drivers ed' },
    pennsylvania: { url: 'http://go.driversed.com/aff_c?offer_id=32&aff_id=1301', provider: 'DriversEd.com', label: 'Teen drivers ed' },
    nevada: { url: 'http://go.aceable.com/aff_c?offer_id=349&aff_id=1301', provider: 'Aceable', label: 'Teen drivers ed' },
    florida: { url: 'http://go.aceable.com/aff_c?offer_id=356&aff_id=1301', provider: 'Aceable', label: 'DETS course' },
  },
};

export const driversEdLink = (state) =>
  (state && DRIVERS_ED.states[String(state).toLowerCase().replace(/\s+/g, '-')]) || DRIVERS_ED.default;
