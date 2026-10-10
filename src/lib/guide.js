// Teen Driving Guide data. URLs match the old site exactly:
//   /guide/{state-name}/   e.g. /guide/new-york/
//   /guide/{city}-{st}/    e.g. /guide/columbus-oh/
// State requirements (data/guide/requirements.json) were checked against each state's
// licensing agency in October 2026, with sources. The 2018-era WordPress text is retired.
// The old school listings (/listing/{id}/{slug}/) forward to their city or state guide.
import statesRaw from '../data/guide/states.json';
import citiesRaw from '../data/guide/cities.json';
import requirements from '../data/guide/requirements.json';
import listingRedirects from '../data/guide/listing-redirects.json';

export const states = statesRaw.map((s) => ({ ...s, req: requirements[s.sname] }));
export const stateBySt = Object.fromEntries(states.map((s) => [s.st, s]));
export const stateBySlug = Object.fromEntries(states.map((s) => [s.slug, s]));

export const cities = citiesRaw.map((c) => ({ ...c, url: `/guide/${c.slug}/` }));
export const citiesBySt = cities.reduce((m, c) => ((m[c.st] ||= []).push(c), m), {});

/** [id, oldPath, newUrl] for every retired listing page. */
export const retiredListings = listingRedirects;

export const CHECKED_LABEL = 'October 2026';
