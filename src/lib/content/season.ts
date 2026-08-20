import { getSeasonalTips } from '../sanity/fetchers';

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'] as const;
export type Season = (typeof SEASONS)[number];

export function currentSeason(date = new Date()): Season {
  const m = date.getMonth();
  if (m <= 1 || m === 11) return 'Winter';
  if (m <= 4) return 'Spring';
  if (m <= 7) return 'Summer';
  return 'Fall';
}

/**
 * Tips for the current season, straight from the CMS. Empty means the
 * section hides, per the graceful-degradation rule; there are no built-in
 * fallback tips.
 */
export async function getTipsForSeason(season: Season): Promise<string[]> {
  const fromCms = await getSeasonalTips(season);
  if (!Array.isArray(fromCms)) return [];
  return fromCms.map((t) => t.tip).filter((t): t is string => Boolean(t));
}
