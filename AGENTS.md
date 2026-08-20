# Agent notes

Read CLAUDE.md first; it is the authoritative project guide (stack, commands,
typing rules, content model, conventions). This file only adds what agents
tend to get wrong.

## Development

- `yarn dev` runs `netlify dev`, NOT `astro dev`. The alert banner fetches
  `/api/fire-status`, which only exists when the Netlify function is running.
- Run `yarn typegen` after any Sanity schema change, and `yarn typecheck`
  before claiming work done (`astro dev` does not type-check .astro files).
- `yarn check` is reserved by Yarn Classic; the type-check script is
  `yarn typecheck`.

## Docs

- Astro docs: https://docs.astro.build (this project is static output, no
  content collections, no Tailwind, no i18n)
- Sanity Studio lives at `/studio`; schema in `schemaTypes/` at the repo root.
