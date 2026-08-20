# Mandan Rural Fire website

The public website for two related bodies that share a name:

- **Mandan Rural Fire Department** (operations): the all-volunteer
  firefighters who respond.
- **Mandan Rural Fire Protection District** (funding): the public body,
  governed by an elected board, that levies taxes and owns the equipment.

The site serves residents of rural Morton County, North Dakota: live fire
danger, prevention tips, board meeting agendas and minutes (the District is a
political subdivision, so open records and accessibility matter), and
volunteer recruitment.

Live at <https://mandanruralfire.netlify.app>.

## Stack

Astro 7 (static output, near-zero client JS), Sanity for content with the
Studio embedded at `/studio`, Netlify for hosting, Forms, and one serverless
function (`/api/fire-status`: NWS Red Flag alerts plus the State of ND's
daily county fire danger rating). TypeScript, strict.

## Setup from a fresh clone

```sh
yarn install
cp .env.example .env    # public Sanity identifiers, no secrets
yarn dev                # netlify dev: site at localhost:8888 WITH /api/fire-status
```

`yarn dev` runs `netlify dev`, not `astro dev`, on purpose: the alert banner
and conditions card need the fire-status function, which only exists under
Netlify's dev server.

## Commands

| Command          | What it does                                                       |
| :--------------- | :----------------------------------------------------------------- |
| `yarn dev`       | netlify dev: Astro plus the fire-status function                   |
| `yarn build`     | `yarn typegen` then `astro build` to `dist/`                       |
| `yarn typegen`   | Regenerates `src/lib/sanity.types.ts` from the Sanity schema. Run after ANY schema change |
| `yarn typecheck` | `astro check`. Named typecheck because Yarn Classic reserves `yarn check` |
| `yarn preview`   | Serves the built `dist/` (no function, so no live fire status)     |

## Deploys

Pushing to `main` deploys via Netlify (config lives in `netlify.toml`, which
overrides the UI). Publishing content in the Studio triggers a rebuild
through a Sanity webhook, so content changes go live a minute or two after
publish, not instantly.

## Where things live

- `CLAUDE.md`: the full project guide: architecture, typing rules, content
  model, conventions. Read it before changing code.
- `schemaTypes/`: the Sanity content model. `src/lib/`: all data access.
  `src/pages/`: one file per route.
- `docs/`: the content editor's guide and the deployment runbook.
