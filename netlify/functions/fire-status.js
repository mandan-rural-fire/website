// fire-status: live fire-weather status for the Mandan rural fire district.
//
// Two sources, one per concern:
//
//   Red Flag Warning / Fire Weather Watch: the National Weather Service alerts
//   API (api.weather.gov) for our point. Free, public, no key, but NWS asks
//   callers to send a User-Agent with a contact and browsers cannot set that
//   header, which is one reason this runs server-side.
//
//   Fire danger rating AND the county burn declaration: the State of North
//   Dakota's ND DES ArcGIS feature service (the same layer behind the official
//   ND Response fire danger map). The rating updates around 6 AM daily
//   (FireIndex 1-5 maps to Low through Extreme per the state webmap's own
//   renderer); the declaration carries per-activity restriction thresholds.
//   We query Morton County.
//
// Running server-side also lets the CDN cache the result so we stay gentle on
// both APIs. No personal data and no secrets are involved.
//
// Returns: { redFlag, fireWatch, fireDanger, burnDeclaration, updated }

const LAT = 46.8267;   // Station 1 area, Morton County. Adjust to taste.
const LON = -100.9293;
const CONTACT = 'mandanruralfd@midconetwork.com'; // shown to NWS in the User-Agent

const COUNTY = 'Morton County';

// Per-activity restriction thresholds from the county's burn declaration.
// Each holds the danger adjective at which that activity becomes prohibited
// ('Low' means prohibited even at Low: an outright ban), or 'Not Applicable'.
// Exported (along with ACTIVITY_LABELS below) for tools/check-fire-data.mjs,
// the scheduled contract check: one list, no drift between site and checker.
export const BURN_ACTIVITY_FIELDS = [
  'campfires_conditions',
  'camp_conditions',
  'charcoal_conditions',
  'controlled_conditions',
  'controlledburns_conditions',
  'cropland_conditions',
  'garbage_conditions',
  'patioorganic_conditions',
  'pellet_conditions',
  'wood_conditions',
];

// Resident-facing labels for the declaration's per-activity fields, ordered
// roughly as Morton County's own declaration lists the activities. Fields
// with no confident public name (the additionalN free-text clauses,
// road_conditions) stay out of the list; the declaration link covers them.
// The fireworks pair matches the county's "fireworks aerial / fireworks
// ground" wording.
// Each activity also has a *_red_checkbox field: whether the county's Red
// Flag Warning trigger applies to it. Counties genuinely vary (Billings
// currently sets none), so this is data, not an assumption.
export const ACTIVITY_LABELS = [
  ['campfires', 'Campfires'],
  ['controlled', 'Controlled burns'],
  ['cropland', 'Cropland burning'],
  ['garbage', 'Garbage burning'],
  ['fireworks', 'Fireworks, aerial'],
  ['fireworks2', 'Fireworks, ground'],
  ['charcoal', 'Charcoal grills & smokers'],
  ['wood', 'Wood-fire grills & smokers'],
  ['pellet', 'Pellet grills & smokers'],
  ['patioorganic', 'Outdoor fireplaces'],
  ['smoking', 'Smoking outdoors'],
  ['camp', 'Camp stoves'],
  ['gas', 'Gas grills'],
];

const ND_FIRE_DANGER_URL =
  'https://services1.arcgis.com/qQaNyq8h4wNEdlUV/arcgis/rest/services/' +
  'Fire_Decs_Indexes_Warnings_Template_Publish/FeatureServer/0/query' +
  `?where=${encodeURIComponent(`county='${COUNTY}'`)}` +
  `&outFields=${[...new Set(['FireIndex', 'Script_Update_Date', 'declaration_status', 'declaration_rescinded', 'remove', 'burn_expiration_date', ...BURN_ACTIVITY_FIELDS, ...ACTIVITY_LABELS.flatMap(([f]) => [`${f}_conditions`, `${f}_red_checkbox`])])].join(',')}` +
  '&returnGeometry=false&f=json';

// The state's official burn restrictions map: the direct app URL, because the
// burnrestrictions.nd.gov vanity redirect misbehaved on some devices. Shows
// the current restrictions and declaration details for every county.
// Exported for the contract check, which asserts the app item still exists
// (the tradeoff of skipping the vanity URL: nothing follows the app if the
// state moves it, so the check watches instead).
export const BURN_RESTRICTIONS_URL = 'https://experience.arcgis.com/experience/c5da309af17b4c48a3b953675a77f654';

// FireIndex legend, confirmed against the renderer in the state's official
// "Fire Danger Rating" webmaps. Index 0 of this array is unused.
const FIRE_INDEX_ADJECTIVES = [null, 'Low', 'Moderate', 'High', 'Very High', 'Extreme'];

// If the state's 6 AM update script stops running, the index goes stale.
// Better to show no rating than yesterday's.
const MAX_RATING_AGE_MS = 36 * 60 * 60 * 1000;

/** Morton County's current adjective rating from the ND DES layer, or null. */
function ndFireDanger(attrs, now = Date.now()) {
  if (!attrs) return null;
  const updated = attrs.Script_Update_Date;
  if (typeof updated === 'number' && now - updated > MAX_RATING_AGE_MS) return null;
  return FIRE_INDEX_ADJECTIVES[attrs.FireIndex] ?? null;
}

/**
 * The county's burn declaration, or null when none is in force. threshold is
 * the most restrictive (lowest) danger level among the burning activities:
 * 'Low' is an outright ban, 'High' matches the standard ND rule.
 */
function ndBurnDeclaration(attrs, now = Date.now()) {
  if (!attrs) return null;
  const active =
    attrs.declaration_status === 'Yes' &&
    attrs.declaration_rescinded !== 'Yes' &&
    attrs.remove !== 'Yes' &&
    (typeof attrs.burn_expiration_date !== 'number' || attrs.burn_expiration_date > now);
  if (!active) return null;

  const order = FIRE_INDEX_ADJECTIVES; // index = severity, [1..5]
  let threshold = null;
  for (const field of BURN_ACTIVITY_FIELDS) {
    const v = attrs[field];
    const idx = order.indexOf(v);
    if (idx > 0 && (threshold === null || idx < order.indexOf(threshold))) threshold = v;
  }
  // Per-activity thresholds for the resources page's restrictions list;
  // 'Not Applicable' and empty fields simply do not appear. redFlag is
  // whether the county's declaration applies its Red Flag trigger to the
  // activity.
  const activities = ACTIVITY_LABELS
    .filter(([field]) => order.indexOf(attrs[`${field}_conditions`]) > 0)
    .map(([field, label]) => ({
      label,
      threshold: attrs[`${field}_conditions`],
      redFlag: attrs[`${field}_red_checkbox`] === 'Yes',
    }));
  return {
    threshold,
    activities,
    link: BURN_RESTRICTIONS_URL,
    expires: typeof attrs.burn_expiration_date === 'number'
      ? new Date(attrs.burn_expiration_date).toISOString()
      : null,
  };
}

export const handler = async function () {
  const out = {
    redFlag: null,
    fireWatch: null,
    fireDanger: null,
    burnDeclaration: null,
    updated: new Date().toISOString(),
  };

  const [alertsRes, dangerRes] = await Promise.allSettled([
    fetch(`https://api.weather.gov/alerts/active?point=${LAT},${LON}`, {
      headers: {
        'User-Agent': `MandanRuralFireDept Website (${CONTACT})`,
        'Accept': 'application/geo+json',
      },
    }),
    fetch(ND_FIRE_DANGER_URL, { headers: { Accept: 'application/json' } }),
  ]);

  // NWS: Red Flag Warning / Fire Weather Watch.
  try {
    if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
      const data = await alertsRes.value.json();
      const feats = Array.isArray(data.features) ? data.features : [];
      for (const f of feats) {
        const p = f.properties || {};
        const ev = p.event || '';
        if (ev === 'Red Flag Warning' && !out.redFlag) {
          out.redFlag = { headline: p.headline || '', ends: p.ends || p.expires || null };
        } else if (ev === 'Fire Weather Watch' && !out.fireWatch) {
          out.fireWatch = { headline: p.headline || '', ends: p.ends || p.expires || null };
        }
      }
    }
  } catch (e) {
    // NWS hiccup: warnings stay null; the manual CMS alert still covers us.
  }

  // ND DES: the daily county fire danger rating and the burn declaration.
  try {
    if (dangerRes.status === 'fulfilled' && dangerRes.value.ok) {
      const json = await dangerRes.value.json();
      const attrs = json?.features?.[0]?.attributes ?? null;
      out.fireDanger = ndFireDanger(attrs);
      out.burnDeclaration = ndBurnDeclaration(attrs);
    }
  } catch (e) {
    // State feed hiccup: nulls mean "not rated / no declaration data" on the
    // site, never a guess.
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      // Cache at the CDN: fresh enough for warnings, light on both APIs.
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(out),
  };
};
