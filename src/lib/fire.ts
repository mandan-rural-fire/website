/**
 * Fire weather status served by netlify/functions/fire-status.js: Red Flag
 * Warning and Fire Weather Watch from the NWS; the daily fire danger rating
 * and the county burn declaration from the State of ND's county fire danger
 * layer. Not Sanity content, so these types are hand-written by necessity:
 * there is nothing to generate them from.
 */

export const DANGER_ORDER = ['Low', 'Moderate', 'High', 'Very High', 'Extreme'] as const;
export type DangerLevel = (typeof DANGER_ORDER)[number];

// Scale/legend hues: decorative fills that never carry text.
export const DANGER_COLORS: Record<DangerLevel, string> = {
  Low: '#3c7a47',
  Moderate: '#2f5d8a',
  High: '#c98a17',
  'Very High': '#c2410c',
  Extreme: '#a82c25',
};

// Pill fills carry white text, so every fill must pass AA with white. The
// bright High amber fails (2.94:1) and dark-on-amber read as a glitch next
// to four white pills, so pills take a darkened amber (white 5.00:1) while
// the scale keeps the bright hue.
export const DANGER_PILL_COLORS: Record<DangerLevel, string> = {
  ...DANGER_COLORS,
  High: '#96660a',
};

export function isDangerLevel(value: unknown): value is DangerLevel {
  return typeof value === 'string' && (DANGER_ORDER as readonly string[]).includes(value);
}

export interface FireWeatherAlert {
  headline: string;
  ends: string | null;
}

/**
 * One activity from the declaration: prohibited at `threshold` or above,
 * and (when redFlag is true) under any Red Flag Warning. Counties set the
 * Red Flag trigger per activity; some set none at all.
 */
export interface BurnActivity {
  label: string;
  threshold: string;
  redFlag?: boolean;
}

/**
 * The county's active burn declaration. threshold is the danger level at
 * which open burning becomes prohibited; 'Low' means prohibited at every
 * level, an outright ban. activities carries the declaration's per-activity
 * thresholds (absent on cached responses from before the field existed).
 */
export interface BurnDeclaration {
  threshold: string | null;
  activities?: BurnActivity[] | null;
  link: string | null;
  expires: string | null;
}

export interface FireStatus {
  redFlag: FireWeatherAlert | null;
  fireWatch: FireWeatherAlert | null;
  fireDanger: string | null;
  burnDeclaration: BurnDeclaration | null;
  updated: string;
}

export type OpenBurning = 'ban' | 'prohibited' | 'allowed' | 'unknown';

/**
 * The state's official burn restrictions map. The direct app URL, not the
 * burnrestrictions.nd.gov vanity redirect: the redirect misbehaved on some
 * devices (Taylor, 2026-08-05). Client-side fallback when the feed carries
 * no declaration link; the function's declaration link points at the same
 * place.
 */
export const ND_BURN_RESTRICTIONS_URL = 'https://experience.arcgis.com/experience/c5da309af17b4c48a3b953675a77f654';

/**
 * The state app's Declarations view: the closest public thing to the signed
 * declaration itself. The PDF is named in the state's data but not publicly
 * attached anywhere (verified against the layer's attachments API and the
 * county site), so this deep link is the least-digging target available.
 */
export const ND_DECLARATIONS_URL =
  'https://experience.arcgis.com/experience/c5da309af17b4c48a3b953675a77f654/page/Dashboard-Page?views=Declarations';

/**
 * The ND rule, plus the county's own declaration when one is in force:
 * an outright county ban (threshold Low) prohibits burning at any rating;
 * otherwise burning is prohibited under a Red Flag Warning or when the
 * rating reaches High (or the county's stricter threshold). With no rating
 * and no warning we say "unknown", never "allowed".
 */
export function openBurning(status: FireStatus | null): OpenBurning {
  if (!status) return 'unknown';
  const threshold = status.burnDeclaration?.threshold ?? null;
  if (threshold === 'Low') return 'ban';
  if (status.redFlag) return 'prohibited';
  const rating = isDangerLevel(status.fireDanger) ? status.fireDanger : null;
  if (!rating) return 'unknown';
  const idx = DANGER_ORDER.indexOf(rating);
  if (idx >= DANGER_ORDER.indexOf('High')) return 'prohibited';
  if (isDangerLevel(threshold) && idx >= DANGER_ORDER.indexOf(threshold)) return 'prohibited';
  return 'allowed';
}

export interface AlertConfig {
  level: 'redflag' | 'burnban';
  tag: string;
  message: string;
  link?: string;
  linkText?: string;
}

/** Returns null on any failure so callers fall back to the manual setting. */
export async function fetchFireStatus(url = '/api/fire-status'): Promise<FireStatus | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (typeof data !== 'object' || data === null) return null;
    const d = data as Partial<FireStatus>;
    return {
      redFlag: d.redFlag ?? null,
      fireWatch: d.fireWatch ?? null,
      fireDanger: d.fireDanger ?? null,
      burnDeclaration: d.burnDeclaration ?? null,
      updated: d.updated ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
