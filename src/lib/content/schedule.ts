import type { MeetingScheduleDoc } from '../sanity/fetchers';

/**
 * Recurring meeting schedule.
 *
 * Upcoming meetings are computed from a rule, not stored as documents. That
 * keeps the CMS free of empty future meetings and means a schedule change is
 * one edit in Site settings rather than a cleanup job.
 */

export interface MeetingRule {
  /** 1-4, or -1 for the last occurrence in the month. */
  weekOfMonth: number;
  /** 0 = Sunday. */
  weekday: number;
  time: string;
  location: string;
}

export const DEFAULT_RULE: MeetingRule = {
  weekOfMonth: 3,
  weekday: 3, // Wednesday
  time: '7:00 PM',
  location: 'Station 1, 3014 34th St NW, Mandan',
};

export function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  if (nth === -1) {
    const last = new Date(year, month + 1, 0);
    const shift = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - shift);
  }
  const first = new Date(year, month, 1);
  const shift = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + shift + (nth - 1) * 7);
}

/** Next occurrence on or after `from`. Only the date parts of the rule are needed. */
export function nextMeetingDate(
  rule: Pick<MeetingRule, 'weekOfMonth' | 'weekday'>,
  from = new Date(),
): Date {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const thisMonth = nthWeekdayOfMonth(
    today.getFullYear(),
    today.getMonth(),
    rule.weekday,
    rule.weekOfMonth,
  );
  if (thisMonth >= today) return thisMonth;
  return nthWeekdayOfMonth(
    today.getFullYear(),
    today.getMonth() + 1,
    rule.weekday,
    rule.weekOfMonth,
  );
}

export function formatMeetingDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Builds the rule from the Meeting schedule document, falling back field by field. */
export function ruleFromSettings(schedule: MeetingScheduleDoc | null | undefined): MeetingRule {
  return {
    weekOfMonth: schedule?.meetingWeekOfMonth ?? DEFAULT_RULE.weekOfMonth,
    weekday: schedule?.meetingWeekday ?? DEFAULT_RULE.weekday,
    time: schedule?.meetingTime ?? DEFAULT_RULE.time,
    location: schedule?.meetingLocation ?? DEFAULT_RULE.location,
  };
}
