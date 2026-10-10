"""Build local practice profiles for city guide pages.

Runs on GitHub Actions (needs internet). Sources — all stable, public data:
  * City center: US Census Bureau Gazetteer (places), internal point of each place.
  * Roads: OpenStreetMap via the Overpass API (© OpenStreetMap contributors, ODbL).
  * Climate: NOAA NCEI U.S. Climate Normals 1991–2020 (annual/seasonal), nearest station
    that reports snowfall.
  * Daylight: sunrise/sunset computed astronomically for the city center (astral).

Usage:  python scripts/city_profiles.py columbus-oh denver-co ...   (or ALL)
Writes: src/data/guide/city-profiles.json (merged with any existing entries)
"""
import csv, io, json, math, re, sys, time, zipfile, datetime as dt
from pathlib import Path
import requests
from astral import LocationInfo
from astral.sun import sun
from timezonefinder import TimezoneFinder
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
CITIES = json.loads((ROOT / 'src/data/guide/cities.json').read_text())
OUT = ROOT / 'src/data/guide/city-profiles.json'
UA = {'User-Agent': 'drvnapp.com city guide builder (contact: info@drvnapp.com)'}
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
GAZ = 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_place_national.zip'
NORMALS = 'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/'
STATIONS = 'https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt'
MI = 1609.344


def miles(a1, o1, a2, o2):
    r = math.radians
    v = math.cos(r(a1)) * math.cos(r(a2)) * math.cos(r(o2) - r(o1)) + math.sin(r(a1)) * math.sin(r(a2))
    return 3958.8 * math.acos(max(-1, min(1, v)))


# ---------- city centers (Census Gazetteer) ----------
def load_gazetteer():
    z = zipfile.ZipFile(io.BytesIO(requests.get(GAZ, headers=UA, timeout=120).content))
    txt = z.read(z.namelist()[0]).decode('latin-1')
    rows = list(csv.DictReader(io.StringIO(txt), delimiter='\t'))
    out = {}
    suffix = re.compile(r'\s+(city|town|village|CDP|borough|municipality|city and borough|urban county|metro government.*|consolidated government.*|unified government.*)$', re.I)
    for r in rows:
        r = {k.strip(): v.strip() for k, v in r.items()}
        name = suffix.sub('', r['NAME']).strip().lower()
        key = (r['USPS'], name)
        is_cdp = r['NAME'].endswith('CDP')
        # Prefer incorporated places over CDPs with the same name.
        if key in out and is_cdp:
            continue
        out[key] = (float(r['INTPTLAT']), float(r['INTPTLONG']))
    return out


# ---------- roads (OpenStreetMap) ----------
def overpass(q):
    for attempt in range(6):
        for url in OVERPASS:
            try:
                r = requests.post(url, data={'data': q}, headers=UA, timeout=180)
                if r.status_code == 200:
                    return r.json()
            except requests.RequestException:
                pass
            time.sleep(10 * (attempt + 1))
    raise RuntimeError('Overpass failed')


def norm_ref(ref):
    ref = ref.strip()
    m = re.match(r'^(I|US|SR|State Route|OH|CO|AZ|MA|IA|NY|[A-Z]{2})[\s-]*(\d+[A-Z]?)', ref)
    if not m:
        return None
    net, num = m.group(1), m.group(2)
    if net == 'I':
        return f'I-{num}'
    if net == 'US':
        return f'US-{num}'
    return None  # state routes are too many and too local to list


def roads(lat, lon):
    near, wide = 8000, 24000  # ~5 and ~15 miles
    q1 = f"""[out:json][timeout:120];
way(around:{wide},{lat},{lon})["highway"~"^(motorway|trunk)$"]["ref"];
out tags;"""
    refs = {}
    for el in overpass(q1).get('elements', []):
        for part in el['tags'].get('ref', '').split(';'):
            n = norm_ref(part)
            if n:
                refs[n] = refs.get(n, 0) + 1
    q2 = f"""[out:json][timeout:120];
way(around:{near},{lat},{lon})["junction"="roundabout"]->.rb;
.rb out center;
node(around:{near},{lat},{lon})["railway"="level_crossing"]->.lc;
.lc out count;
node(around:{near},{lat},{lon})["highway"="traffic_signals"]->.ts;
.ts out count;
way(around:{wide},{lat},{lon})["highway"~"^(unclassified|tertiary)$"]["surface"~"^(gravel|unpaved|dirt|compacted|fine_gravel)$"]->.gv;
.gv out count;
way(around:{near},{lat},{lon})["highway"~"^(motorway|trunk|primary)$"]["lanes"~"^[4-9]$"]->.ml;
.ml out count;"""
    els = overpass(q2).get('elements', [])
    centers = [(e['center']['lat'], e['center']['lon']) for e in els if e.get('type') == 'way' and 'center' in e]
    # A roundabout is often mapped as several ways; merge centers within ~60 m.
    clusters = []
    for c in centers:
        if not any(abs(c[0] - k[0]) < 0.0006 and abs(c[1] - k[1]) < 0.0008 for k in clusters):
            clusters.append(c)
    counts = [int(e['tags'].get('total', 0)) for e in els if e.get('type') == 'count']
    lc, ts, gv, ml = (counts + [0, 0, 0, 0])[:4]

    def sort_key(r):
        net, num = r.split('-')
        return (0 if net == 'I' else 1, int(re.sub(r'\D', '', num) or 0))

    hw = sorted(refs, key=sort_key)
    return {
        'interstates': [r for r in hw if r.startswith('I-')],
        'usRoutes': [r for r in hw if r.startswith('US-')],
        'roundabouts': len(clusters),
        'railCrossings': lc,
        'trafficSignals': ts,
        'unpavedRoads': gv,
        'multiLaneWays': ml,
    }


# ---------- climate (NOAA 1991–2020 normals) ----------
def load_stations():
    listing = requests.get(NORMALS, headers=UA, timeout=180).text
    have = set(re.findall(r'href="([A-Z0-9]{11})\.csv"', listing))
    stations = []
    for line in requests.get(STATIONS, headers=UA, timeout=180).text.splitlines():
        sid = line[0:11]
        if sid in have:
            stations.append((sid, float(line[12:20]), float(line[21:30]), line[41:71].strip().title()))
    return stations


def fnum(v):
    try:
        x = float(str(v).strip())
        return None if x <= -7777 else x
    except ValueError:
        return None


def climate(lat, lon, stations):
    ranked = sorted(stations, key=lambda s: miles(lat, lon, s[1], s[2]))[:25]
    for sid, slat, slon, name in ranked:
        d = miles(lat, lon, slat, slon)
        if d > 40:
            break
        r = requests.get(f'{NORMALS}{sid}.csv', headers=UA, timeout=60)
        if r.status_code != 200:
            continue
        row = next(csv.DictReader(io.StringIO(r.text)), None)
        if not row:
            continue
        snow = fnum(row.get('ANN-SNOW-NORMAL'))
        wet = fnum(row.get('ANN-PRCP-AVGNDS-GE010HI'))
        frz = fnum(row.get('ANN-TMIN-AVGNDS-LSTH032'))
        if snow is None or wet is None:
            continue
        return {
            'station': sid, 'stationName': name, 'stationMiles': round(d, 1),
            'snowInches': round(snow, 1), 'snowDays': fnum(row.get('ANN-SNOW-AVGNDS-GE010TI')),
            'wetDays': round(wet), 'freezeNights': round(frz) if frz is not None else None,
            'hotDays': fnum(row.get('ANN-TMAX-AVGNDS-GRTH089')),
        }
    return None


# ---------- daylight (astral) ----------
def fmt_time(t):
    s = t.strftime('%-I:%M %p').lower().replace('am', 'a.m.').replace('pm', 'p.m.')
    return s


def daylight(lat, lon, tzname):
    tz = ZoneInfo(tzname)
    loc = LocationInfo(latitude=lat, longitude=lon, timezone=tzname)
    year = 2026
    days = [dt.date(year, 1, 1) + dt.timedelta(d) for d in range(365)]
    sunsets = []
    for d in days:
        s = sun(loc.observer, date=d, tzinfo=tz)
        sunsets.append((d, s['sunset'], s['dusk']))
    early = min(sunsets, key=lambda x: (x[1].hour, x[1].minute))
    late = max(sunsets, key=lambda x: (x[1].hour, x[1].minute))
    # Typical school-night dark time in mid-November (after DST ends) and mid-March (before/after DST)
    nov = next(x for x in sunsets if x[0] == dt.date(year, 11, 15))
    return {
        'tz': tzname,
        'earliestSunset': fmt_time(early[1]), 'earliestSunsetDate': early[0].strftime('%B %-d'),
        'earliestDark': fmt_time(early[2]),
        'latestSunset': fmt_time(late[1]), 'latestSunsetDate': late[0].strftime('%B %-d'),
        'novSunset': fmt_time(nov[1]),
    }


def main(slugs):
    wanted = CITIES if slugs == ['ALL'] else [c for c in CITIES if c['slug'] in set(slugs)]
    prev = json.loads(OUT.read_text()) if OUT.exists() else {}
    gaz = load_gazetteer()
    stations = load_stations()
    tf = TimezoneFinder()
    for i, c in enumerate(wanted):
        center = gaz.get((c['st'], c['city'].lower()))
        lat, lon = center if center else (c['lat'], c['lon'])
        tzname = tf.timezone_at(lat=lat, lng=lon) or 'America/New_York'
        try:
            prof = {
                'center': [round(lat, 5), round(lon, 5)], 'centerSource': 'census' if center else 'zip',
                'roads': roads(lat, lon),
                'climate': climate(lat, lon, stations),
                'daylight': daylight(lat, lon, tzname),
                'built': dt.date.today().isoformat(),
            }
            prev[c['slug']] = prof
            print(i + 1, c['slug'], json.dumps(prof)[:300], flush=True)
        except Exception as e:  # keep going; a missing profile just means the section is omitted
            print('FAILED', c['slug'], e, flush=True)
        time.sleep(2)
        if (i + 1) % 25 == 0:
            OUT.write_text(json.dumps(prev, separators=(',', ':')))
    OUT.write_text(json.dumps(prev, indent=1 if len(prev) < 50 else None, separators=None if len(prev) < 50 else (',', ':')))


if __name__ == '__main__':
    main(sys.argv[1:] or ['ALL'])
