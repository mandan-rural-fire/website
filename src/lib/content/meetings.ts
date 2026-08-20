import { getMeetingsRaw } from '../sanity/fetchers';
import { renderBody } from '../sanity/portableText';

/**
 * Meetings, mapped from the raw query result into what pages actually render:
 * a display date, a single resolved location string, and bodies already
 * converted to HTML.
 *
 * The view type is derived from this function rather than declared, so it can
 * never drift from the mapping. Note the name: TypeGen emits a `Meeting`
 * document type, so this is `MeetingView` to avoid colliding with it.
 */

type MeetingRaw = Awaited<ReturnType<typeof getMeetingsRaw>>[number];

function toDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolveLocation(m: {
  locationType?: string | null;
  otherLocation?: string | null;
  stationName?: string | null;
  stationAddress?: string | null;
}): string {
  if (m.locationType === 'other') return m.otherLocation ?? '';
  return [m.stationName, m.stationAddress].filter(Boolean).join(', ');
}

/** Meetings missing a slug or date cannot be routed, so they are dropped. */
function isRoutable(m: MeetingRaw): m is MeetingRaw & { slug: string; date: string } {
  return Boolean(m.slug && m.date);
}

export async function getMeetings() {
  const raw = await getMeetingsRaw();
  return raw.filter(isRoutable).map((m) => ({
    slug: m.slug,
    date: m.date,
    dateLabel: toDateLabel(m.date),
    title: m.title ?? 'Board meeting',
    time: m.time ?? '',
    location: resolveLocation(m),
    agendaBody: renderBody(m.agendaBody),
    minutesBody: renderBody(m.minutesBody),
    agendaPdfUrl: m.agendaPdfUrl ?? null,
    minutesPdfUrl: m.minutesPdfUrl ?? null,
    minutesStatus: m.minutesStatus ?? null,
  }));
}

/** Derived from the mapping above. Do not hand-write this. */
export type MeetingView = Awaited<ReturnType<typeof getMeetings>>[number];

export const hasAgenda = (m: MeetingView): boolean => Boolean(m.agendaBody || m.agendaPdfUrl);
export const hasMinutes = (m: MeetingView): boolean => Boolean(m.minutesBody || m.minutesPdfUrl);

/**
 * Rows for the agendas-and-minutes list on the district page: the past two
 * years (plus anything upcoming). Older meetings stay in the CMS as the
 * archive of record; the page notes they are available from the board on
 * request.
 */
export async function getMeetingListEntries() {
  const all = await getMeetings();
  const now = new Date();
  const cutoff = `${now.getFullYear() - 2}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return all.filter((m) => m.date >= cutoff).map((m) => ({
    date: m.dateLabel,
    dateIso: m.date,
    title: m.title,
    agendaUrl: hasAgenda(m) ? `/agendas/${m.slug}` : undefined,
    minutesUrl: hasMinutes(m) ? `/minutes/${m.slug}` : undefined,
  }));
}

export type MeetingEntry = Awaited<ReturnType<typeof getMeetingListEntries>>[number];

/** The most recent meetings that have minutes, for the home page teaser. */
export async function getRecentMinutes(limit = 3): Promise<MeetingView[]> {
  const all = await getMeetings();
  return all.filter(hasMinutes).slice(0, limit);
}
