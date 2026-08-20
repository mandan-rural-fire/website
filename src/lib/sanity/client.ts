import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity environment variables. Set PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET in .env',
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  // Also set on the @sanity/astro integration in astro.config.mjs (which
  // exists for the /studio route); keep the two in sync.
  apiVersion: '2026-07-01',
  // Two different correctness needs:
  // - Builds (PROD) must read LIVE data: a CDN-cached query can make a
  //   webhook-triggered rebuild deploy the content from before the publish.
  // - Dev renders every page on request with no memoization (so Studio
  //   edits appear), which means 5-9 API round trips per page view; the
  //   CDN cuts that from seconds to fast, and its staleness is bounded to
  //   moments, not the life of the dev server.
  useCdn: import.meta.env.DEV,
});
