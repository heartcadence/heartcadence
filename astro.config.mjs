// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://heartcadence.com',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
  // Scorecards stay out of the sitemap until launch (KB-165). Remove the filter then.
  integrations: [sitemap({ lastmod: new Date(), filter: (page) => !page.includes('/scorecards/') })],
  vite: { plugins: [tailwindcss()] },
});
