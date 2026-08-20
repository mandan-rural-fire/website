// Standalone copy of the schedule math so the Studio schema has no dependency
// on src/. The rule itself is read live from Site settings (see
// fetchMeetingRule), so a board schedule change reaches new-meeting defaults
// without touching this file; the constants below are only the last-resort
// fallback when that query fails.

import type { SanityClient } from 'sanity';

interface Rule {
  weekOfMonth: number;
  weekday: number;
}

const FALLBACK_RULE: Rule = { weekOfMonth: 3, weekday: 3 }; // third Wednesday

/** The meeting rule from the Meeting schedule document, falling back to third Wednesday. */
export async function fetchMeetingRule(client: SanityClient): Promise<Rule> {
  try {
    const s = await client.fetch<{ meetingWeekOfMonth?: number; meetingWeekday?: number } | null>(
      '*[_type == "meetingSchedule"][0]{meetingWeekOfMonth, meetingWeekday}',
    );
    return {
      weekOfMonth: s?.meetingWeekOfMonth ?? FALLBACK_RULE.weekOfMonth,
      weekday: s?.meetingWeekday ?? FALLBACK_RULE.weekday,
    };
  } catch {
    return FALLBACK_RULE;
  }
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  if (nth === -1) {
    const last = new Date(year, month + 1, 0);
    const shift = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - shift);
  }
  const first = new Date(year, month, 1);
  const shift = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + shift + (nth - 1) * 7);
}

/** YYYY-MM-DD for the next scheduled meeting, used as the initial value on new meetings. */
export function nextMeetingDefault(rule: Rule = FALLBACK_RULE, from = new Date()): string {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let d = nthWeekdayOfMonth(today.getFullYear(), today.getMonth(), rule.weekday, rule.weekOfMonth);
  if (d < today)
    d = nthWeekdayOfMonth(
      today.getFullYear(),
      today.getMonth() + 1,
      rule.weekday,
      rule.weekOfMonth,
    );
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
