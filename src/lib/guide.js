// Teen Driving Guide data, recovered from the old WordPress database
// (tables stateinfo, companies, zips). URLs match the old site exactly:
//   /guide/{state-name}/          e.g. /guide/new-york/
//   /guide/{city}-{st}/           e.g. /guide/columbus-oh/
//   /listing/{id}/{name-city-st}/ e.g. /listing/403/dublin-driving-school-llc-dublin-oh/
import statesRaw from '../data/guide/states.json';
import citiesRaw from '../data/guide/cities.json';
import listingsRaw from '../data/guide/listings.json';

const stripTags = (v) => (typeof v === 'string' ? v.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : v);

export const states = statesRaw.map((s) => {
  const out = {};
  for (const [k, v] of Object.entries(s)) out[k] = stripTags(v);
  return out;
});
export const stateBySt = Object.fromEntries(states.map((s) => [s.st, s]));
export const stateBySlug = Object.fromEntries(states.map((s) => [s.slug, s]));

export const listings = listingsRaw.map((l) => ({ ...l, url: `/listing/${l.id}/${l.path}/`, website: cleanWebsite(l.web) }));
export const listingById = new Map(listings.map((l) => [l.id, l]));
const listingsBySt = listings.reduce((m, l) => ((m[l.st] ||= []).push(l), m), {});

export const cities = citiesRaw.map((c) => ({ ...c, url: `/guide/${c.slug}/` }));
export const citiesBySt = cities.reduce((m, c) => ((m[c.st] ||= []).push(c), m), {});
const cityByKey = new Map(cities.map((c) => [`${c.st}|${c.city.toLowerCase()}`, c]));
export const cityFor = (name, st) => (name ? cityByKey.get(`${st}|${String(name).toLowerCase()}`) : undefined);

function cleanWebsite(w) {
  if (!w || /^n\/?a$/i.test(w.trim())) return null;
  return /^https?:\/\//i.test(w) ? w.trim() : `http://${w.trim()}`;
}

/** Fill the {city} placeholder that a few state texts carry. */
export function fillCity(text, city) {
  if (!text) return text;
  if (city) return text.replaceAll('{city}', city);
  return text.replace(/a \{city\} area/g, 'a local').replace(/\{city\},\s*/g, '').replaceAll('{city}', '');
}

export const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

// The four kinds of place the old guide listed, keyed to the step they support.
export const PLACE_TYPES = {
  cls: { step: 1, label: 'Driver’s ed program' },
  reg: { step: 2, label: 'Permit exam location' },
  car: { step: 4, label: 'Driving instructor' },
  exam: { step: 5, label: 'License exam location' },
};

/** Nearby places for a city page, grouped by type, nearest first (10 each, like the old site). */
export function nearbyByType(city, limit = 10) {
  const groups = { cls: [], reg: [], car: [], exam: [] };
  for (const [id, miles] of city.near) {
    const l = listingById.get(id);
    if (!l) continue;
    for (const t of Object.keys(groups)) if (l[t] && groups[t].length < limit) groups[t].push({ ...l, miles });
  }
  return groups;
}

/** Other listings near a listing (same state, by straight-line distance). */
export function nearbyListings(listing, limit = 6) {
  if (listing.lat == null) return [];
  const toRad = (d) => (d * Math.PI) / 180;
  const out = [];
  for (const l of listingsBySt[listing.st] || []) {
    if (l.id === listing.id || l.lat == null || l.osa) continue;
    const v = Math.cos(toRad(listing.lat)) * Math.cos(toRad(l.lat)) * Math.cos(toRad(l.lon) - toRad(listing.lon)) + Math.sin(toRad(listing.lat)) * Math.sin(toRad(l.lat));
    const miles = 3959 * Math.acos(Math.max(-1, Math.min(1, v)));
    if (miles < 35) out.push({ ...l, miles: Math.round(miles * 10) / 10 });
  }
  return out.sort((a, b) => a.miles - b.miles).slice(0, limit);
}

export const formatPhone = (p) => {
  const d = String(p || '').replace(/\D/g, '').replace(/^1/, '');
  return d.length >= 10 ? { text: `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`, tel: `tel:+1${d.slice(0, 10)}` } : null;
};

export const mapsUrl = (l) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([l.addr, l.city, l.st, l.zip].filter(Boolean).join(', '))}`;
