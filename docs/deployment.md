# Deployment runbook

How the site is hosted and how to rebuild any piece of it from scratch. The
only recurring cost to the district is the domain.

## The moving parts

```
GitHub (tbosch82/mrfd-website, branch main)
   push -> Netlify builds and deploys        (code changes)

Sanity (project ri0z6y8l, dataset production)
   publish -> webhook -> Netlify build hook  (content changes)
```

- **Netlify site**: `mandanruralfire` (site id
  `81aa63f9-275b-44b0-9b0c-55ef4d6e0b6a`), serving
  <https://mandanruralfire.netlify.app>.
- **Build settings live in `netlify.toml`**, which overrides the UI:
  `yarn build` into `dist/`, Node 22, headers, and the `/api/fire-status`
  redirect to the serverless function.
- **Environment variables** on Netlify (Site configuration → Environment
  variables): `PUBLIC_SANITY_PROJECT_ID=ri0z6y8l`,
  `PUBLIC_SANITY_DATASET=production`. Public identifiers, not secrets; the
  same values as `.env.example`.

## The content webhook

Static builds don't update when content publishes; this pair makes them:

1. **Netlify build hook** named "Sanity content publish" (Site
   configuration → Build & deploy → Build hooks). POSTing its URL triggers a
   main-branch build. The URL itself stays out of the repo; read it from the
   Netlify UI.
2. **Sanity webhook** (manage.sanity.io → project → API → Webhooks) that
   POSTs to that build-hook URL on create, update, and delete of documents.

**Verify it's alive**: publish any trivial content change in the Studio,
then watch Netlify's Deploys list; a build should start within seconds,
titled after the build hook. Or POST the hook URL with curl and confirm a
build starts.

**Recreate it**: create a new build hook in the Netlify UI, then point the
Sanity webhook at the new URL. Neither side needs code changes.

## The fire-status function

`netlify/functions/fire-status.js`, reachable at `/api/fire-status`. Two
upstream sources, no keys:

- NWS alerts API for Red Flag Warning / Fire Weather Watch (needs the
  contact email in its User-Agent, set in the file).
- The State of ND's county fire danger ArcGIS layer for the daily rating
  (Morton County; FireIndex 1-5 maps to Low through Extreme) and the county
  burn declaration (per-activity restriction thresholds; a threshold of
  "Low" is an outright ban and auto-raises the site's County Burn Ban
  banner). If the state ever moves the service, the site shows "Not rated
  today" / "Check restrictions" rather than breaking; update
  `ND_FIRE_DANGER_URL` in the function.

## Deploying code

Push to `main`. Netlify builds (`yarn typegen && astro build`) and deploys.
Rollback: Netlify UI → Deploys → pick an older deploy → "Publish deploy".

## Rebuilding from nothing

1. New Netlify site from the GitHub repo. `netlify.toml` carries the build
   config; add the two env vars above.
2. Recreate the build hook + Sanity webhook (section above).
3. In manage.sanity.io, confirm the deployed origin is in the CORS origins
   list so `/studio` can talk to the API.
3a. A SECOND build hook ("Studio publish button",
   https://api.netlify.com/build_hooks/6a73fb89734037808310ddc0) powers the
   Studio's Update website tool (deployTool.tsx), the secretary's
   self-service rebuild button. It works whether or not the content webhook
   is enabled. The hook URL ships in the public Studio bundle by accepted
   tradeoff; if it is ever abused, delete the hook in Netlify, create a new
   one, and update deployTool.tsx.
4. Netlify Forms picks up the volunteer form automatically on first deploy.
   Submissions collect in the dashboard under Forms → volunteer-application;
   nothing emails anyone until you add notifications: Project configuration →
   Notifications → Form submission notifications → "Add notification" →
   Email. One notification per recipient; add several (chief, secretary) and
   remove them there any time. Netlify runs Akismet spam filtering on every
   submission automatically; the form also carries a honeypot field.

## Custom domain checklist (when it happens)

1. Add the domain in Netlify (Domain management) and follow its DNS
   instructions; HTTPS is automatic.
2. Change `site` in `astro.config.mjs` to the new origin (one line), and the
   Sitemap line in `public/robots.txt`.
3. Add the new origin to Sanity's CORS origins (with credentials) for
   `/studio`.
4. Redeploy.
