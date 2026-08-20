# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

A single website serving two related bodies:

- **Mandan Rural Fire Department** (operations): the all-volunteer firefighters who respond.
- **Mandan Rural Fire Protection District** (funding): the public body, governed by an
  elected board, that levies taxes and owns the equipment.

They share the name and the site. A recurring theme in the copy is explaining which is
which, so residents know who does what. The District is a political subdivision of North
Dakota, which is why the site takes accessibility and open-records framing seriously.

Independent build by Taylor Bosch for a small fee. The only recurring cost to the
district is the domain.

## Stack

- **Astro 7**, static output. Near-zero client JS: the deliberate exceptions are the
  hover prefetcher and the ClientRouter (view transitions), which swaps pages without
  document teardown. CONSEQUENCE: component scripts run once per DOCUMENT, not per page.
  Element bindings go inside a `document.addEventListener('astro:page-load', ...)` handler
  (fires on first load too); document-level listeners and intervals register once at module
  top and query current elements each time; `is:inline` scripts that must re-run need
  `data-astro-rerun` plus their own timer cleanup (see SeasonalTip).
- **Sanity** for content, with the Studio embedded at `/studio` (needs React, which is why
  `@astrojs/react` is installed; React is used ONLY by the Studio, not the public site).
- **Netlify** for hosting, Forms (the volunteer application), and one serverless function.
- **TypeScript**, strict, with `noUncheckedIndexedAccess`.
- **Webfonts** (Sora, Inter, IBM Plex Mono) self-hosted via fontsource imports in
  `Base.astro`; only the weights the stylesheet uses.

## Commands

```bash
yarn dev        # netlify dev — NOT astro dev. The alert banner needs /api/fire-status,
                # which only exists when the Netlify function is running.
yarn build      # runs typegen, then astro check, then astro build
yarn typegen    # sanity schema extract --force --enforce-required-fields && sanity typegen generate
                # (--force because extract refuses to overwrite an existing schema.json)
yarn typecheck  # astro check (type-checks .astro files; astro dev does not).
                # Named typecheck, not check: Yarn Classic reserves `yarn check` for its
                # own dependency-tree verify, so `yarn check` would never run astro check.
```

Run `yarn typegen` after ANY schema change. The generated file is `src/lib/sanity.types.ts`
(committed, so a fresh clone typechecks; `schema.json` is gitignored and regenerated).

## Architecture

### Directory layout

```
schemaTypes/          Sanity content model (root level, not in src). Studio config, not app code.
  scheduleDefaults.ts Standalone schedule math for the Studio's new-meeting default date.
                      Reads the rule from meetingSchedule (async initialValue); constants are
                      only the fetch-failure fallback.
structure.ts          Desk structure, grouped by owner (alert / board / department / website).
                      Pins each singleton to one document.
sanity.config.ts      Studio config. projectId/dataset hardcoded (they are public identifiers).
                      Enforces the four singletons (newDocumentOptions + actions).
sanity.cli.ts         CLI + typegen config.
astro.config.mjs      site URL, Astro + Sanity + React + sitemap integrations. Uses loadEnv.
netlify.toml          Source of truth for the build: command, publish dir, Node version,
                      headers, and the /api/fire-status redirect. Overrides the Netlify UI.
netlify/functions/
  fire-status.js      Red Flag / Fire Weather Watch from the NWS alerts API; the daily fire
                      danger rating AND the county burn declaration from the State of ND's
                      county fire danger ArcGIS layer (Morton County, FireIndex 1-5 =
                      Low..Extreme; declaration threshold 'Low' = outright ban). Also exposes
                      the declaration's per-activity thresholds and per-activity Red Flag
                      triggers (labels from Morton's own declaration wording) for the
                      resources page's BurnActivityList. Free APIs, no keys. Open-burning
                      logic lives in src/lib/fire.ts (openBurning). A daily GitHub Action
                      (.github/workflows/fire-data-contract.yml, tools/check-fire-data.mjs)
                      contract-checks the layer, the state's daily fire danger PNG the
                      resources page hotlinks, and the NWS endpoint; field lists import from
                      the function so they cannot drift.
docs/
  editor-guide.md     For the secretary: how to post agendas, minutes, the burn ban banner.
  deployment.md       Runbook: Netlify/Sanity wiring, the content webhook, rebuild steps.
src/
  data/nav.ts         The seven nav entries, one place.
  layouts/Base.astro  Head (canonical/OG meta), fonts, fixed sidebar nav, footer. Footer
                      contacts come from siteSettings, mailing from districtFacts; street
                      address from the HQ station.
  components/          Presentational. NextMeeting shows the earliest future meeting
                      document if one exists, else the computed schedule date, and
                      re-picks client-side so static pages cannot go stale.
  lib/                 All data access and view models. See below.
  pages/               One file per route. Fetch in frontmatter, render in template.
  styles/global.css    The dark theme. Do not restructure; it carries hard-won spacing and
                       border rules (band backgrounds, final-section border-top, footer flush).
```

### The lib layer (important)

```
src/lib/
  sanity/
    client.ts         Configured client. useCdn:false so webhook rebuilds read live data.
    queries.ts        All GROQ, each wrapped in defineQuery so TypeGen can find it.
    fetchers.ts       Thin fetch wrappers, memoized per build (one process = one build).
                      Exports DERIVED item types (see typing rules).
    image.ts          imageUrl(), imageAlt(), imageDims(), imageSrcSet(), ImageRef.
    portableText.ts   renderBody(): Portable Text to HTML.
    index.ts          Barrel. Pages import from '../lib/sanity'.
  content/
    meetings.ts       MeetingView (derived), list entries, recent minutes, has/agenda helpers.
    schedule.ts       Recurring meeting rule + date math. Upcoming meetings are COMPUTED.
    season.ts         Current season + tips (CMS with built-in fallback).
  defaults.ts         Fallback constants (contact info, map URLs) + telHref. Identity facts
                      fall back; figures (stats, mill rate) never do, they hide instead.
  fire.ts             fire-status feed types + fetch. NOT Sanity, so hand-typed by necessity.
```

## Typing rules (do not violate)

1. **Never hand-write a query result type.** TypeGen emits `*_QUERY_RESULT` types from the
   `defineQuery` calls in `sanity/queries.ts`. Note the naming: because the query variables
   are SCREAMING_SNAKE_CASE, the generated types are `MEETINGS_QUERY_RESULT`, not
   `MEETINGS_QUERYResult`.
2. **Derive item types, don't declare them.** Pattern:
   `type Officer = Awaited<ReturnType<typeof getOfficers>>[number]`.
   The common ones are already exported from `sanity/fetchers.ts`.
3. **View models are derived from their mapping function, not declared:**
   `export type MeetingView = Awaited<ReturnType<typeof getMeetings>>[number]`.
   Add a field to the `.map()` and the type follows.
4. **Watch for name collisions.** TypeGen emits a document type per schema (`Meeting`,
   `Station`, `Officer`, `Apparatus`, `BoardMember`, `Happening`, `SeasonalTip`,
   `PreventionTopic`, `SiteSettings`). Local view types must be named differently
   (`MeetingView`, not `Meeting`) or the generated one shadows them. This already bit us once.
5. **`--enforce-required-fields` is on**, so schema fields with `.required()` are non-optional
   in generated types and everything else is `| null`. Expect real null guards in templates.
   That is the point; do not paper over them with `any`.
6. **Exactly two contained casts exist**: the Portable Text block cast in
   `sanity/portableText.ts` and the image source cast in `sanity/image.ts`. Do not add more.

## Content model

Document types: `meeting`, `boardMember`, `township`, `vote`, `officer`, `station`,
`apparatus`, `preventionTopic`, `happening`, `seasonalTip`. Votes (ballot measures, NOT
director elections; those live in annual-meeting minutes) are created when scheduled,
highlighted via `VoteCard` (home + district) until voting day, filtered at build time and
re-checked client-side so a card cannot linger. Afterward the same document takes
`outcome` and `resultSummary` and renders in the district page's past-votes record. Singletons: `siteSettings`, `alertBanner`,
`meetingSchedule`, `districtFacts` (enforced in `sanity.config.ts`: not creatable from the
global menu, not duplicatable or deletable). Settings are split by owner so the Studio
navigates by task; do not grow siteSettings back into a junk drawer.

Key relationships and patterns:

- **apparatus.station** is a reference. The stations query pulls each station's apparatus
  via a nested subquery (`station._ref == ^._id`). The equipment page flattens them for the
  fleet grid while keeping the station name.
- **Board vacancy is computed, never bookkept.** `township` documents are the canonical
  list; each has two seats with no primary/secondary designation. A `boardMember` exists
  only for a real person (township reference); a township with fewer than two members
  renders its remaining seats as "Open" via `content/board.ts` (`getBoardRoster`). Do not
  create placeholder documents. Members without a township are at-large.
- **Meeting agenda vs minutes.** Two field groups. Agenda is published before a meeting,
  minutes after. A meeting shows in the agenda list if it has an agenda body or PDF, and in
  the minutes list if it has minutes; use the `hasAgenda`/`hasMinutes` helpers from
  `content/meetings.ts`, never inline re-implementations. Upcoming meetings that only have
  an agenda show a "pending" minutes state.
- **PDFs.** Agendas and minutes can carry an uploaded PDF (`agendaPdf`, `minutesPdf`) offered
  as a download, alongside the pasted web version. The secretary pastes Word content into the
  block editor and optionally uploads the signed PDF.
- **Recurring meetings are NOT documents.** The schedule is a rule in meetingSchedule
  (`meetingWeekOfMonth`, `meetingWeekday`, `meetingTime`). `src/lib/content/schedule.ts`
  computes the next date. A posted future meeting document overrides the computed rule
  on the Next meeting cards (earliest future date wins; that is how special or
  rescheduled meetings get announced); `NextMeeting.astro` re-picks in the browser so
  the card cannot go stale between rebuilds. Only meetings with real agenda/minutes
  content become documents. Do not create empty future meeting documents.
- **Images** are fields on their owner (`apparatus.photo`, `station.photo`, `happening.photo`,
  `officer.photo`, `siteSettings.heroImage`), each with a nested `alt` field for accessibility.
  Render through `SanityImage.astro` (dimensions + srcset come free).

## Graceful degradation

Every page must render cleanly when the CMS is empty or partial. Sections with no data hide
themselves or show a one-line "coming soon". This lets the site deploy before content entry
is finished. Preserve this when editing pages; do not assume data exists.

Corollary: identity facts (phone, email, founded year) may fall back to the constants in
`lib/defaults.ts`; figures (mill rate, volunteer count, square miles, station counts) must
NEVER fall back to invented values. Hide them or adapt the copy instead.

## Deployment notes

Full runbook: `docs/deployment.md`. The essentials:

- Env vars `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` are set in Netlify
  (and in `.env` locally, from `.env.example`; they are public identifiers).
- Static builds do not update on publish. A Sanity webhook (filtered to exclude drafts)
  POSTs a Netlify build hook on publish/unpublish/delete, triggering a rebuild. Publishing
  takes a minute or two, not instant.
- The volunteer form is a Netlify Form (`data-netlify="true"`, hidden `form-name`, honeypot).
  It posts to `/join/thanks`. It never collects SSNs; that is deliberate and stated on the page.
- `fire-status.js` sends a User-Agent with a contact to the NWS, because NWS asks for one and
  browsers cannot set that header. That is why the fetch is server-side, not client-side.
- Contrast is verified: solid fills under white text use `--accent-dk`, small accent text on
  cards uses `--accent-text`. Danger pills always carry white text: fills come from
  `DANGER_PILL_COLORS` (High is a darkened amber, 5.0:1 with white; the bright amber lives
  only in the text-free scale/legend, `DANGER_COLORS`). Compute ratios before changing any
  of these pairings; the footer promises WCAG 2.1 AA.

## Conventions

- No em dashes anywhere, copy or comments. The owner dislikes them. Use commas/colons/periods.
- Keep structural/explanatory copy in templates (version-controlled). Keep changing content
  in the CMS. Do not model everything as editable fields.
- Minimal formatting in copy. Plain, modern, not folksy.
- Ask before schema changes; they require typegen and can ripple through generated types.
