# drvnapp.com

The DRVN website, built with [Astro](https://astro.build) and published to AWS (S3 + CloudFront). Every push to `main` builds the site and publishes it automatically (see `.github/workflows/deploy.yml`).

## Adding an article

1. Create a Markdown file in `src/articles/`, e.g. `src/articles/21-left-turns.md`.
2. Start it with this header, then write the article below it:

```markdown
---
slug: unprotected-left-turns          # the URL: drvnapp.com/unprotected-left-turns/
title: "The headline as it appears on the page"
seoTitle: "The title Google shows (under ~60 characters)"
dek: "The one-line subhead under the headline."
description: "The meta description Google shows (under ~160 characters)."
published: "2026-10-20T12:00:00Z"
cluster: "The Skills"
sources:
  - "Source name, what it supports"
---
```

3. Use `## Heading` for section heads and `> line` for a pull quote.
4. Commit to `main`. The site rebuilds and publishes in about two minutes.

## Where things live

| What | Where |
| --- | --- |
| New articles | `src/articles/*.md` |
| Original WordPress posts (same URLs as before) | `src/data/posts.json` |
| Brand colors and type | `src/styles/global.css` |
| Links (app stores, affiliates, social) | `src/site.js` |
| Redirects from old WordPress URLs | `infra/viewer-request.js` (deployed as a CloudFront Function) |

## Working locally

```
npm install
npm run dev
```
