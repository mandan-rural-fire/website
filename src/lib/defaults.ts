/**
 * Site-wide fallback constants and tiny shared helpers, in one place so a
 * phone number or map change is a one-file edit.
 *
 * Fallbacks here are identity facts (who we are, how to reach us) used when
 * the corresponding CMS field is empty. Figures that could mislead if guessed
 * (stats, the mill rate) deliberately have NO fallback; pages hide them
 * instead. The Netlify function keeps its own copy of the contact email, it
 * cannot import TypeScript from src/.
 */

export const FALLBACK_PHONE = '(701) 663-6624';
export const FALLBACK_STATE_RADIO = '1-800-472-2121';
export const FALLBACK_EMAIL = 'mandanruralfd@midconetwork.com';
export const FALLBACK_FOUNDED = 1962;
export const FALLBACK_MAILING =
  'Mandan Rural Fire\nProtection District\nPO Box 187\nMandan, ND 58554-0187';
export const FALLBACK_DEPT_ADDRESS = '3014 34th St NW, Mandan, ND 58554';

/**
 * Display label for a YYYY-MM-DD date, parsed as local parts (never
 * new Date(iso), which shifts a day in negative UTC offsets).
 */
export function formatDateLabel(iso: string, withWeekday = true): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    ...(withWeekday ? { weekday: 'long' as const } : {}),
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** tel: href from a human-formatted phone number. */
export const telHref = (n: string): string => 'tel:' + n.replace(/[^0-9]/g, '');

/**
 * Consistent display formatting for phone numbers regardless of how they
 * were typed into the Studio: every recognized number wears the same
 * (xxx) xxx-xxxx face, including toll-free numbers typed with a leading 1
 * (dialing works without it in the US). Anything unrecognized renders as
 * entered rather than guessed at.
 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '');
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith('1')) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return raw;
}

/** ArcGIS embeds, shared by the district and resources pages. */
export const DISTRICT_MAP_EMBED =
  'https://www.arcgis.com/apps/mapviewer/index.html?configurableview=true&webmap=6dcc6438be1e409e8fca3227824e4651&theme=dark&legend=true&scroll=false&center=-100.90532544339592,46.672440334322246&scale=577790.5542885';
export const DISTRICT_MAP_FULL =
  'https://www.arcgis.com/apps/mapviewer/index.html?webmap=6dcc6438be1e409e8fca3227824e4651';
export const MORTON_COUNTY_EM_URL = 'https://www.mortonnd.gov/emergencymanagement';
