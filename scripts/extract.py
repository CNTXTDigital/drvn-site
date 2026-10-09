"""Extract DRVN WordPress content from scraped page snapshots into clean JSON.

Usage: python3 -I scripts/extract.py migration/raw migration/content.json
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment

RAW, OUT = Path(sys.argv[1]), Path(sys.argv[2])
SITE = "https://www.drvnapp.com"

ALLOWED = {"p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i", "a",
           "blockquote", "img", "br", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption"}


def clean(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    for t in soup.find_all(["script", "style", "iframe", "form", "noscript"]):
        t.decompose()
    for t in soup.find_all(True):
        if t.name == "h1":
            t.name = "h2"
        if t.name in ("b",):
            t.name = "strong"
        if t.name in ("i",):
            t.name = "em"
        if t.name not in ALLOWED:
            t.unwrap()
            continue
        keep = {}
        if t.name == "a" and t.get("href"):
            href = t["href"].strip()
            href = href.replace("http://www.drvnapp.com", SITE).replace("https://drvnapp.com", SITE)
            if href.startswith(SITE):
                href = href[len(SITE):] or "/"
            keep["href"] = href
        if t.name == "img":
            if t.get("src"):
                keep["src"] = t["src"]
            keep["alt"] = t.get("alt", "")
            keep["loading"] = "lazy"
        t.attrs = keep
    out = str(soup)
    out = out.replace(" ", " ")
    out = re.sub(r"<p>\s*</p>", "", out)
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


def meta(m, *keys):
    for k in keys:
        v = m.get(k)
        if isinstance(v, list):
            v = v[0] if v else None
        if v:
            return v
    return None


records = []
for f in sorted(RAW.glob("*.txt")):
    d = json.loads(f.read_text())
    m = d.get("metadata", {})
    url = m.get("sourceURL") or m.get("url")
    if not url or "wp-json" in url:
        continue
    path = url.replace(SITE, "") or "/"
    raw = d.get("rawHtml", "")
    soup = BeautifulSoup(raw, "html.parser")
    rec = {
        "path": path,
        "title": (soup.title.string or "").strip() if soup.title else "",
        "ogTitle": meta(m, "og:title", "ogTitle"),
        "description": meta(m, "og:description", "ogDescription", "description"),
        "image": meta(m, "og:image", "ogImage"),
        "published": meta(m, "article:published_time", "publishedTime"),
        "modified": meta(m, "article:modified_time", "modifiedTime"),
        "canonical": (soup.find("link", rel="canonical") or {}).get("href") if soup.find("link", rel="canonical") else None,
    }
    body = raw.find('trustAsHtml(article.text)">')
    if body != -1:
        start = body + len('trustAsHtml(article.text)">')
        end = raw.find('<div class="crp_related', start)
        frag = raw[start:end]
        # trim the closing </div> of the content container
        frag = frag[: frag.rfind("</div>")] if "</div>" in frag else frag
        rec["type"] = "post"
        rec["html"] = clean(frag)
        hdr = soup.select_one(".article-header img")
        if hdr and hdr.get("src"):
            rec["image"] = hdr["src"]
        ttl = soup.select_one(".article-header .title")
        if ttl:
            date = ttl.select_one(".date")
            rec["displayDate"] = date.get_text(strip=True) if date else None
            if date:
                date.extract()
            rec["heading"] = ttl.get_text(" ", strip=True)
    else:
        rec["type"] = "page"
        rec["markdown"] = d.get("markdown", "")
    records.append(rec)

OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False))
print(f"{len(records)} records -> {OUT}")
for r in records:
    print(r["type"], r["path"], len(r.get("html") or r.get("markdown") or ""), r.get("published"), (r.get("description") or "")[:40])
