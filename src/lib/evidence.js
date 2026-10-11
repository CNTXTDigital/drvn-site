// The DRVN evidence library: every source we cite, and the claims they support.
// Articles list source ids in their frontmatter; pages link claims as /evidence/#<claim-id>.
import data from '../data/evidence.json';

export const EVIDENCE = data;
export const SOURCES = data.sources;
export const GROUPS = data.groups;
export const CLAIMS = data.groups.flatMap((g) => g.claims.map((c) => ({ ...c, group: g.id })));

// Accepts source ids or legacy plain-text strings; returns {id, org, title, url, date, ...}.
export const resolveSources = (list = []) =>
  list.map((s) => (typeof s === 'string' && SOURCES[s] ? { id: s, ...SOURCES[s] } : { title: String(s) }));

export const claimsUsedIn = (slug) => CLAIMS.filter((c) => c.usedIn.includes(slug));

// Sources for a page = its own list plus the sources behind library claims it uses.
export const sourcesFor = (slug, own = []) => {
  const ids = [...own];
  for (const c of claimsUsedIn(slug)) for (const id of c.sources) if (!ids.includes(id)) ids.push(id);
  return resolveSources(ids);
};

export const citationLD = (sources) =>
  sources.filter((s) => s.url).map((s) => ({
    '@type': s.doi ? 'ScholarlyArticle' : 'CreativeWork',
    name: s.title,
    url: s.url,
    ...(s.doi ? { sameAs: `https://doi.org/${s.doi}` } : {}),
    ...(s.authors ? { author: s.authors } : {}),
    publisher: { '@type': 'Organization', name: s.org },
  }));
