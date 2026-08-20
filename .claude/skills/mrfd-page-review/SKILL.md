---
name: mrfd-page-review
description: Use when design-reviewing any page of the MRFD website (home, department, district, prevention, resources, equipment, join, agendas/minutes), or when asked for a design pass, QA pass, or layout review on this repo.
---

# MRFD Page Design Review

**REQUIRED BACKGROUND:** Follow the global `astro-design-review` skill for
the process. This file holds the MRFD-specific parameters.

## Setup

```bash
yarn build                        # typegen + astro check + build; never review astro dev
lsof -ti :4323 | xargs -r kill    # a stale server here serves the OLD build silently
node tools/review-server.mjs      # dist + /api/fire-status fixtures on :4323
curl http://localhost:4323/_mode  # MUST return JSON; anything else = stale server on the port
curl 'http://localhost:4323/_mode?set=ban'   # switch state, no restart
```

Fire-status modes: `calm | high | redflag | ban | norating`. Only pages
using AlertBanner or ConditionsCard (home) react to them; other pages still
need the server for correct 404/asset behavior.

## Width ladder

Breakpoints live in `src/styles/global.css` (grep `@media`; re-grep, they
change). Currently meaningful stops: **1440, 1370/1350** (hero two-column at
1360), **1200, 990/970** (sidebar collapses 980), **890/870** (grids 880),
**768** (footer 2x2 runs 600-950), **650/630** (banner dismiss 640), **545/535**
(single-column 540), **460, 390, 360**. Run the scrollWidth overflow check at
every stop; screenshot and read the load-bearing ones.

## House rules to verify on every page

- **Two-tier kickers:** gold `.eyebrow` only for page/section starts; grey
  `.kicker` for labels inside cards. No exceptions, no third style.
- **Contrast:** the footer promises WCAG 2.1 AA. Compute any pair not
  already on record; solid fills under white text use `--accent-dk`, small
  accent text on cards uses `--accent-text`, pills always carry white text
  (the High pill fill is the darkened amber DANGER_PILL_COLORS.High, 5.0:1;
  the bright amber lives only in the text-free scale).
- **Figures never fabricate:** stats and the mill rate hide when the CMS
  field is empty; identity facts (phone, email, founded) fall back to
  `lib/defaults.ts`. Flag any literal that should derive from CMS data.
- **Bands sit flush:** no leaked page background between adjacent full-bleed
  bands (the hero/emergency-band seam is the precedent).
- **Labels and links wrap as units,** never mid-phrase (`.condnote` pattern).
- **No em dashes** anywhere in copy. Plain, modern voice.

## CMS states

Build-time content can't be stubbed; verify empty/populated branches by
reading the template (`length === 0` paths) and note which state the live
CMS exercised. Sections that hide when empty: stats tiles, officers, board,
stations/fleet, happenings, seasonal tips, recent minutes, prevention topics.

## Reporting

Findings doc as an artifact, same format as prior reviews (verdict, what's
working, chip-severitied findings with evidence, state table, width table);
prior docs are linked from the session history if a template is needed.
After sign-off: one finding per commit, verified at the width/state where
found, outcomes recorded back into the doc. **Commit locally, do NOT push;**
pushes burn Netlify build minutes (see the batch-pushes memory).
