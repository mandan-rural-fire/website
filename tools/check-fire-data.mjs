// Contract check for the external data the site depends on, run daily by
// .github/workflows/fire-data-contract.yml. The site is fail-soft (a schema
// change degrades it to fallbacks, never wrong data), so this check exists to
// make that degradation LOUD: any assertion failing fails the workflow and
// GitHub emails the repo owner.
//
//   node tools/check-fire-data.mjs
//
// Checks: the ND DES county layer's row for Morton, the fields the site
// reads (imported from the function, so the lists cannot drift), the value
// vocabulary, data freshness, the daily fire danger PNG, the NWS alerts
// endpoint, and the burn-restrictions Experience app. The app check goes
// through the ArcGIS item API: the app page itself serves the same SPA
// shell (200) for real and dead ids alike, so only item metadata proves
// the app still exists and is still the fire app.
import { BURN_ACTIVITY_FIELDS, ACTIVITY_LABELS, BURN_RESTRICTIONS_URL } from '../netlify/functions/fire-status.js';

const LAYER_QUERY =
  'https://services1.arcgis.com/qQaNyq8h4wNEdlUV/arcgis/rest/services/' +
  'Fire_Decs_Indexes_Warnings_Template_Publish/FeatureServer/0/query' +
  "?where=county%3D'Morton%20County'&outFields=*&returnGeometry=false&f=json";
const PNG_URL = 'https://gis.des.nd.gov/nddesfireindex.png';
const NWS_URL = 'https://api.weather.gov/alerts/active?point=46.8267,-100.9293';

const ADJECTIVES = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'];
const CONDITION_VALUES = new Set([null, 'Not Applicable', ...ADJECTIVES]);
const MAX_AGE_MS = 36 * 60 * 60 * 1000;

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
};

// 1. The county layer row and every field the site reads.
try {
  const res = await fetch(LAYER_QUERY, { headers: { Accept: 'application/json' } });
  check(res.ok, `layer query responds (${res.status})`);
  const json = await res.json();
  const attrs = json?.features?.[0]?.attributes;
  check(Boolean(attrs), 'Morton County row exists');
  if (attrs) {
    const fields = [
      'FireIndex', 'Script_Update_Date', 'declaration_status',
      'declaration_rescinded', 'remove', 'burn_expiration_date',
      ...BURN_ACTIVITY_FIELDS,
      ...ACTIVITY_LABELS.flatMap(([f]) => [`${f}_conditions`, `${f}_red_checkbox`]),
    ];
    for (const f of [...new Set(fields)]) {
      check(f in attrs, `field present: ${f}`);
    }
    check(
      attrs.FireIndex === null || (Number.isInteger(attrs.FireIndex) && attrs.FireIndex >= 1 && attrs.FireIndex <= 5),
      `FireIndex in range: ${attrs.FireIndex}`,
    );
    check(
      typeof attrs.Script_Update_Date === 'number' && Date.now() - attrs.Script_Update_Date < MAX_AGE_MS,
      `rating fresh (Script_Update_Date ${attrs.Script_Update_Date ? new Date(attrs.Script_Update_Date).toISOString() : attrs.Script_Update_Date})`,
    );
    for (const [f] of ACTIVITY_LABELS) {
      const v = attrs[`${f}_conditions`];
      check(CONDITION_VALUES.has(v), `condition vocabulary: ${f}_conditions = ${JSON.stringify(v)}`);
    }
  }
} catch (e) {
  check(false, `layer query threw: ${e.message}`);
}

// 2. The daily fire danger PNG the resources page hotlinks.
try {
  const res = await fetch(PNG_URL, { method: 'HEAD' });
  check(res.ok, `fire danger PNG responds (${res.status})`);
  check((res.headers.get('content-type') ?? '').includes('image/png'), 'PNG content type');
  const modified = Date.parse(res.headers.get('last-modified') ?? '');
  check(Number.isFinite(modified) && Date.now() - modified < MAX_AGE_MS, `PNG fresh (${res.headers.get('last-modified')})`);
} catch (e) {
  check(false, `PNG check threw: ${e.message}`);
}

// 3. The burn-restrictions Experience app every restrictions link targets.
try {
  const appId = /\/experience\/([0-9a-f]{32})/.exec(BURN_RESTRICTIONS_URL)?.[1];
  check(Boolean(appId), `restrictions URL carries an app id (${BURN_RESTRICTIONS_URL})`);
  if (appId) {
    const res = await fetch(`https://www.arcgis.com/sharing/rest/content/items/${appId}?f=json`);
    check(res.ok, `ArcGIS item API responds (${res.status})`);
    const item = await res.json();
    check(!item.error, `app item exists (${item.error?.message ?? 'ok'})`);
    check(item.type === 'Web Experience', `item is a Web Experience (${item.type})`);
    check(item.access === 'public', `item is public (${item.access})`);
    check(/fire|burn/i.test(item.title ?? ''), `item is still the fire app ("${item.title}")`);
  }
} catch (e) {
  check(false, `app item check threw: ${e.message}`);
}

// 4. The NWS alerts endpoint behind Red Flag / Fire Weather Watch banners.
try {
  const res = await fetch(NWS_URL, {
    headers: { 'User-Agent': 'MandanRuralFireDept website contract check (mandanruralfd@midconetwork.com)', Accept: 'application/geo+json' },
  });
  check(res.ok, `NWS alerts responds (${res.status})`);
  const json = await res.json();
  check(Array.isArray(json?.features), 'NWS features array');
} catch (e) {
  check(false, `NWS check threw: ${e.message}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\nAll contract checks passed.');
