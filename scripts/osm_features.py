"""Phase 1 of the city profile build: pull the few road features we use out of one
state's OpenStreetMap extract (Geofabrik), as compact point lists.

Usage: python scripts/osm_features.py <filtered.osm.pbf> <out.json.gz>
(The workflow first shrinks the state file with `osmium tags-filter`.)
"""
import gzip, json, sys
import osmium

UNPAVED = {'gravel', 'unpaved', 'dirt', 'compacted', 'fine_gravel'}
RURAL = {'unclassified', 'tertiary'}


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.sig, self.lc, self.rb, self.unp, self.hw, self.place = [], [], [], [], [], []

    def node(self, n):
        t = n.tags
        if not n.location.valid():
            return
        p = [round(n.location.lat, 5), round(n.location.lon, 5)]
        if t.get('highway') == 'traffic_signals':
            self.sig.append(p)
        if t.get('railway') == 'level_crossing':
            self.lc.append(p)
        if t.get('place') in ('city', 'town', 'village', 'hamlet', 'suburb') and t.get('name'):
            self.place.append(p + [t.get('name'), t.get('place')])

    def way(self, w):
        t = w.tags
        try:
            pts = [(nd.location.lat, nd.location.lon) for nd in w.nodes if nd.location.valid()]
        except osmium.InvalidLocationError:
            return
        if not pts:
            return
        if t.get('junction') == 'roundabout':
            self.rb.append([round(sum(p[0] for p in pts) / len(pts), 5), round(sum(p[1] for p in pts) / len(pts), 5)])
        if t.get('highway') in RURAL and t.get('surface') in UNPAVED:
            self.unp.append([round(pts[0][0], 4), round(pts[0][1], 4)])
        if t.get('highway') in ('motorway', 'trunk') and t.get('ref'):
            ref = t.get('ref')
            for p in pts[::6] + [pts[-1]]:
                self.hw.append([round(p[0], 4), round(p[1], 4), ref])


if __name__ == '__main__':
    h = H()
    h.apply_file(sys.argv[1], locations=True, idx='flex_mem')
    out = {'sig': h.sig, 'lc': h.lc, 'rb': h.rb, 'unp': h.unp, 'hw': h.hw, 'place': h.place}
    with gzip.open(sys.argv[2], 'wt') as f:
        json.dump(out, f, separators=(',', ':'))
    print({k: len(v) for k, v in out.items()})
