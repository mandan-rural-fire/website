// @ts-check
import { defineConfig } from 'astro/config';

import { loadEnv } from 'vite';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } =
  loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Canonical origin, used for canonical URLs, og:url, and the sitemap.
  site: 'https://mandanruralfire.org',
  // Fetch pages on link hover so navigation feels instant. The injected
  // script is ~1KB; the exception to zero-JS is deliberate.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // Mirrors src/lib/sanity/client.ts (the client pages actually use);
      // keep apiVersion and useCdn in sync with it.
      apiVersion: '2026-07-01',
      useCdn: false,
      studioBasePath: '/studio',
    }),
    react(),
    // The Studio is an app and the form-thanks page is transactional; neither
    // belongs in the sitemap.
    sitemap({ filter: (page) => !page.includes('/studio') && !page.includes('/join/thanks') }),
  ],
});
