import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Every URL ends in a slash, matching the WordPress permalinks Google has indexed.
export default defineConfig({
  site: 'https://www.drvnapp.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
