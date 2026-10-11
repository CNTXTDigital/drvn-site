// Shared schema.org entities. Base.astro adds ORG and WEBSITE to every page; pages refer to
// them by @id so search engines see one DRVN organization, one founder, one website.
import { SITE } from '../site.js';

export const ORG_ID = `${SITE.url}/#organization`;
export const SITE_ID = `${SITE.url}/#website`;
export const FOUNDER_ID = `${SITE.url}/about/#founder`;
export const APP_ID = `${SITE.url}/app/#app`;

export const ORG = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'DRVN',
  legalName: 'DRVN, LLC',
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', url: `${SITE.url}/apple-touch-icon.png`, width: 180, height: 180 },
  image: `${SITE.url}/drvn-logo.svg`,
  description: SITE.tagline,
  email: 'info@drvnapp.com',
  foundingDate: '2016',
  founder: { '@id': FOUNDER_ID },
  sameAs: [...Object.values(SITE.social), SITE.appStore, SITE.googlePlay],
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: 'DRVN',
  url: `${SITE.url}/`,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-US',
  copyrightHolder: { '@id': ORG_ID },
};

export const FOUNDER = {
  '@type': 'Person',
  '@id': FOUNDER_ID,
  name: 'Robert Abbott',
  url: `${SITE.url}/about/#founder`,
  image: `${SITE.url}/images/site/robert-abbott-headshot.jpg`,
  jobTitle: 'Founder',
  worksFor: { '@id': ORG_ID },
  description: 'Communication designer, entrepreneur and father of four who founded DRVN to help parents teach their teenagers to drive.',
};

export const AUTHOR_REF = { '@type': 'Person', '@id': FOUNDER_ID, name: 'Robert Abbott', url: `${SITE.url}/about/#founder` };

// crumbs: [{ name, path }] after Home. The last one is the current page.
export const breadcrumbLD = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((c, i) => ({
    '@type': 'ListItem', position: i + 1, name: c.name, item: new URL(c.path, SITE.url).href,
  })),
});

export const articleLD = ({ url, headline, description, image, published, modified, citation, section, byOrg = false }) => ({
  '@type': 'Article',
  '@id': `${url}#article`,
  headline,
  description,
  image: image ? [new URL(image, SITE.url).href] : undefined,
  datePublished: published,
  dateModified: modified || published,
  mainEntityOfPage: url,
  author: byOrg ? { '@id': ORG_ID } : AUTHOR_REF,
  publisher: { '@id': ORG_ID },
  isPartOf: { '@id': SITE_ID },
  inLanguage: 'en-US',
  articleSection: section,
  copyrightHolder: { '@id': ORG_ID },
  copyrightYear: Number(String(published).slice(0, 4)),
  citation: citation?.length ? citation : undefined,
});
