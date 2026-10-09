// Teen Driving Guide data, recovered from the old WordPress database (stateinfo, zips).
// URLs match the old site exactly:
//   /guide/{state-name}/   e.g. /guide/new-york/
//   /guide/{city}-{st}/    e.g. /guide/columbus-oh/
// The old school listings (/listing/{id}/{slug}/) are retired: each URL forwards to its
// city guide, or to the state guide where there is no city page (data/guide/listing-redirects.json).
import statesRaw from '../data/guide/states.json';
import citiesRaw from '../data/guide/cities.json';
import listingRedirects from '../data/guide/listing-redirects.json';

const stripTags = (v) => (typeof v === 'string' ? v.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : v);

export const states = statesRaw.map((s) => {
  const out = {};
  for (const [k, v] of Object.entries(s)) out[k] = stripTags(v);
  return out;
});
export const stateBySt = Object.fromEntries(states.map((s) => [s.st, s]));
export const stateBySlug = Object.fromEntries(states.map((s) => [s.slug, s]));

export const cities = citiesRaw.map((c) => ({ ...c, url: `/guide/${c.slug}/` }));
export const citiesBySt = cities.reduce((m, c) => ((m[c.st] ||= []).push(c), m), {});

/** [id, oldPath, newUrl] for every retired listing page. */
export const retiredListings = listingRedirects;

/** Fill the {city} placeholder that a few state texts carry. */
export function fillCity(text, city) {
  if (!text) return text;
  if (city) return text.replaceAll('{city}', city);
  return text.replace(/a \{city\} area/g, 'a local').replace(/\{city\},\s*/g, '').replaceAll('{city}', '');
}

export const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
