import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

// Sitemap <lastmod> only where we know the real date a page's content last changed:
// articles (last commit to the Markdown file), legacy posts (WordPress modified date),
// the complete guide, and the state/city guides (last commit to the requirements data or
// guide template). Every other page is listed without a lastmod rather than with a guess.
// The deploy workflow checks out full history (fetch-depth: 0) so these dates are real.
const gitDate = (...paths) => {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
};
const LASTMOD = new Map();
for (const f of readdirSync('src/articles').filter((f) => f.endsWith('.md'))) {
  const slug = readFileSync(`src/articles/${f}`, 'utf8').match(/^slug:\s*"?([^"\n]+)"?/m)?.[1];
  const d = gitDate(`src/articles/${f}`);
  if (slug && d) LASTMOD.set(`/${slug}/`, d);
}
for (const p of JSON.parse(readFileSync('src/data/posts.json', 'utf8'))) {
  if (!LASTMOD.has(`/${p.slug}/`) && (p.modified || p.published)) LASTMOD.set(`/${p.slug}/`, p.modified || p.published);
}
const safetyDate = gitDate('src/pages/teen-driving-safety/');
if (safetyDate) LASTMOD.set('/teen-driving-safety/', safetyDate);
const guideDate = gitDate('src/data/guide/requirements.json', 'src/data/guide/states.json', 'src/pages/guide/[slug].astro');

// Every URL ends in a slash, matching the WordPress permalinks Google has indexed.
export default defineConfig({
  site: 'https://www.drvnapp.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // Skip the 404 page and the retired /listing/ redirect pages.
      filter: (page) => !page.includes('/404') && !page.includes('/listing/'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const d = LASTMOD.get(path) || (path.startsWith('/guide/') && path !== '/guide/' ? guideDate : null);
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
      },
    }),
  ],
});
