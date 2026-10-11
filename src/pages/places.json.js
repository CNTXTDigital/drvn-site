// Search index for the "Find your city or state" box on /guide/ (PlaceSearch, fetched on focus).
// Cities are ordered by population so bigger places rank first among equal matches.
// Compact form: n = state names by code; p = [label, slug] for cities ("Aurora, CO"), [name, slug, 1] for states.
import { states, cities } from '../lib/guide.js';

export function GET() {
  const data = {
    n: Object.fromEntries(states.map((s) => [s.st, s.sname])),
    p: [...states.map((s) => [s.sname, s.slug, 1]), ...[...cities].sort((a, b) => (b.pop || 0) - (a.pop || 0)).map((c) => [`${c.city}, ${c.st}`, c.slug])],
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}
