import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Every URL ends in a slash, matching the WordPress permalinks Google has indexed.
export default defineConfig({
  site: 'https://www.drvnapp.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // Skip the 404 page and the retired /listing/ redirect pages.
      filter: (page) => !page.includes('/404') && !page.includes('/listing/'),
    }),
  ],
});
