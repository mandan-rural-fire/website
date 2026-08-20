# src/lib

```
lib/
  sanity/               everything that talks to the CMS
    client.ts           configured client, env guards
    queries.ts          GROQ, all wrapped in defineQuery for TypeGen
    fetchers.ts         thin fetch wrappers, memoized per build + derived item types
    image.ts            imageUrl / imageAlt / imageDims / imageSrcSet
    portableText.ts     renderBody, one of the two contained casts
    index.ts            barrel: import from '../lib/sanity'
  content/              view models built on top of the raw data
    meetings.ts         MeetingView, list entries, recent minutes
    schedule.ts         recurring meeting rule and date math
    season.ts           current season + tips with fallback
  defaults.ts           fallback constants (contact, maps) + telHref
  fire.ts               fire-status feed types and fetch (not Sanity)
```

## Typing rules

The authoritative list lives in CLAUDE.md ("Typing rules"); read it there.
The short version: never hand-write a query result type, derive item and view
types from their fetcher or mapping function, name view types so they cannot
collide with generated document types (`MeetingView`, not `Meeting`), and run
`yarn typegen` after every schema change.

Two deliberately contained casts exist in this layer: the Portable Text block
cast in `sanity/portableText.ts` and the image source cast in
`sanity/image.ts`. Do not add more.

## Import paths

```ts
import { getSettings, getOfficers, imageUrl, renderBody } from '../lib/sanity';
import { getMeetings, type MeetingView } from '../lib/content/meetings';
import { ruleFromSettings, nextMeetingDate } from '../lib/content/schedule';
import { currentSeason, getTipsForSeason } from '../lib/content/season';
import { telHref, FALLBACK_PHONE } from '../lib/defaults';
import { fetchFireStatus, DANGER_ORDER } from '../lib/fire';
```
