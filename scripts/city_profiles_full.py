"""Phase 2 of the city profile build: combine every state's road features (from
osm_features.py) and compute a profile for every city guide page.

Same measures and wording sources as city_profiles.py (the prototype, which used the
Overpass API one city at a time); this version works offline on national data, so it
scales to all cities and counts roads across state lines.

Usage: python scripts/city_profiles_full.py <features_dir>
Writes: src/data/guide/city-profiles.json
"""
import glob, gzip, json, math, re, sys, time, datetime as dt
import numpy as np
from scipy.spatial import cKDTree
from timezonefinder import TimezoneFinder

sys.path.insert(0, 'scripts')
from city_profiles import (CITIES, OUT, load_gazetteer, load_stations, daylight, norm_ref,
                           NORMALS, UA, fnum, miles)
import requests, csv, io

R_EARTH_MI = 3958.8
NEAR_MI, WIDE_MI = 8000 / 1609.344, 24000 / 1609.344  # same radii as the prototype (8 km / 24 km)


def xyz(lat, lon):
    lat, lon = np.radians(lat), np.radians(lon)
    return np.column_stack([np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat)])


def chord(mi):
    return 2 * math.sin(mi / R_EARTH_MI / 2)


class Layer:
    def __init__(self, pts):
        self.pts = np.array(pts, dtype=float) if pts else np.zeros((0, 2))
        self.tree = cKDTree(xyz(self.pts[:, 0], self.pts[:, 1])) if len(self.pts) else None

    def within(self, lat, lon, mi):
        if self.tree is None:
            return []
        return self.tree.query_ball_point(xyz(np.array([lat]), np.array([lon]))[0], chord(mi))


def load_features(d):
    acc = {'sig': [], 'lc': [], 'rb': [], 'unp': [], 'hw': [], 'place': []}
    for f in sorted(glob.glob(f'{d}/**/*.json.gz', recursive=True)):
        with gzip.open(f, 'rt') as fh:
            part = json.load(fh)
        for k in acc:
            acc[k].extend(part.get(k, []))
        print('loaded', f, {k: len(v) for k, v in part.items()}, flush=True)
    # Features near state lines appear in both neighbors' extracts: de-duplicate.
    for k in ('sig', 'lc', 'rb', 'unp'):
        acc[k] = list({(round(p[0], 4), round(p[1], 4)) for p in acc[k]})
    return acc


def cluster_count(points):
    """Roundabouts are often mapped as several ways: merge centers within ~60 m."""
    kept = []
    for p in points:
        if not any(abs(p[0] - k[0]) < 0.0006 and abs(p[1] - k[1]) < 0.0008 for k in kept):
            kept.append(p)
    return len(kept)


_station_cache = {}


def station_row(sid):
    if sid not in _station_cache:
        row = None
        for attempt in range(3):
            try:
                r = requests.get(f'{NORMALS}{sid}.csv', headers=UA, timeout=60)
                if r.status_code == 200:
                    row = next(csv.DictReader(io.StringIO(r.text)), None)
                break
            except requests.RequestException:
                time.sleep(5)
        _station_cache[sid] = row
        time.sleep(0.15)
    return _station_cache[sid]


def climate(lat, lon, stations, st_tree):
    _, idx = st_tree.query(xyz(np.array([lat]), np.array([lon]))[0], k=25)
    for i in idx:
        sid, slat, slon, name = stations[i]
        d = miles(lat, lon, slat, slon)
        if d > 40:
            break
        row = station_row(sid)
        if not row:
            continue
        snow, wet = fnum(row.get('ANN-SNOW-NORMAL')), fnum(row.get('ANN-PRCP-AVGNDS-GE010HI'))
        if snow is None or wet is None:
            continue
        frz = fnum(row.get('ANN-TMIN-AVGNDS-LSTH032'))
        return {'station': sid, 'stationName': name, 'stationMiles': round(d, 1),
                'snowInches': round(snow, 1), 'snowDays': fnum(row.get('ANN-SNOW-AVGNDS-GE010TI')),
                'wetDays': round(wet), 'freezeNights': round(frz) if frz is not None else None}
    return None


def main(features_dir, only=None):
    f = load_features(features_dir)
    layers = {k: Layer(f[k]) for k in ('sig', 'lc', 'rb', 'unp')}
    hw_pts = Layer([p[:2] for p in f['hw']])
    hw_refs = [p[2] for p in f['hw']]
    gaz = load_gazetteer()
    # OpenStreetMap town-center markers, by lowercase name (they sit downtown, unlike the
    # Census internal point of very large places such as Alaska's city-boroughs).
    RANK = {'city': 0, 'town': 1, 'village': 2, 'suburb': 3, 'hamlet': 4}
    places = {}
    for lat_, lon_, name, kind in f['place']:
        places.setdefault(name.lower(), []).append((lat_, lon_, RANK.get(kind, 9)))
    stations = load_stations()
    st_tree = cKDTree(xyz(np.array([s[1] for s in stations]), np.array([s[2] for s in stations])))
    tf = TimezoneFinder()
    out = json.loads(OUT.read_text()) if (only and OUT.exists()) else {}
    t0 = time.time()
    todo = [c for c in CITIES if not only or c['slug'] in only or c['st'] in only]
    for i, c in enumerate(todo):
        center = gaz.get((c['st'], c['city'].lower()))
        ref_lat, ref_lon = center if center else (c['lat'], c['lon'])
        cands = [(miles(ref_lat, ref_lon, a, b), r, a, b) for a, b, r in places.get(c['city'].lower(), [])]
        cands = [x for x in cands if x[0] <= 40]
        if cands:
            best = min(cands, key=lambda x: (x[1], x[0]))
            lat, lon, src = best[2], best[3], 'osm-place'
        else:
            lat, lon, src = ref_lat, ref_lon, 'census' if center else 'zip'
        refs = set()
        for j in hw_pts.within(lat, lon, WIDE_MI):
            for part in hw_refs[j].split(';'):
                n = norm_ref(part)
                if n:
                    refs.add(n)
        key = lambda r: (0 if r.startswith(('I-', 'H-')) else 1, int(re.sub(r'\D', '', r.split('-')[1]) or 0))
        hw = sorted(refs, key=key)
        rb_pts = [layers['rb'].pts[j] for j in layers['rb'].within(lat, lon, NEAR_MI)]
        try:
            prof = {
                'center': [round(lat, 5), round(lon, 5)], 'centerSource': src,
                'roads': {
                    'interstates': [r for r in hw if r.startswith(('I-', 'H-'))],
                    'usRoutes': [r for r in hw if r.startswith('US-')],
                    'roundabouts': cluster_count(rb_pts),
                    'railCrossings': len(layers['lc'].within(lat, lon, NEAR_MI)),
                    'trafficSignals': len(layers['sig'].within(lat, lon, NEAR_MI)),
                    'unpavedRoads': len(layers['unp'].within(lat, lon, WIDE_MI)),
                },
                'climate': climate(lat, lon, stations, st_tree),
                'daylight': daylight(lat, lon, tf.timezone_at(lat=lat, lng=lon) or 'America/New_York'),
                'built': dt.date.today().isoformat(),
            }
            out[c['slug']] = prof
        except Exception as e:
            print('FAILED', c['slug'], e, flush=True)
        if (i + 1) % 100 == 0:
            print(f'{i + 1}/{len(todo)} cities, {time.time() - t0:.0f}s, last {c["slug"]}: {json.dumps(prof)[:200]}', flush=True)
    OUT.write_text(json.dumps(out, separators=(',', ':')))
    missing_climate = sum(1 for v in out.values() if not v['climate'])
    print('done', len(out), 'profiles;', missing_climate, 'without climate data')


if __name__ == '__main__':
    main(sys.argv[1], set(sys.argv[2:]) or None)
