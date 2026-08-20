import { getBoardMembers, getTownships } from '../sanity/fetchers';

/**
 * The board roster, grouped for the district page: one entry per township
 * (from the canonical township documents) with its primary and secondary
 * seats, filled or open. A seat is open simply because no member document
 * claims it; vacancy is computed, never bookkept. Members without a
 * township are the at-large group.
 *
 * Types are derived from these functions per the house typing rules.
 */

type Member = Awaited<ReturnType<typeof getBoardMembers>>[number];

function bySeat(members: Member[], township: string, seat: string): Member | null {
  return members.find((m) => m.township === township && m.seat === seat) ?? null;
}

export async function getBoardRoster() {
  const [members, townships] = await Promise.all([getBoardMembers(), getTownships()]);

  const townshipNames = townships
    .map((t) => t.name)
    .filter((n): n is string => Boolean(n));

  const rows = townshipNames.map((name) => ({
    name,
    primary: bySeat(members, name, 'primary'),
    secondary: bySeat(members, name, 'secondary'),
  }));

  const atLarge = members.filter((m) => !m.township);

  const seatsTotal = townshipNames.length * 2;
  const seatsFilled = rows.reduce(
    (n, r) => n + (r.primary ? 1 : 0) + (r.secondary ? 1 : 0),
    0
  );

  // The people list, board officers first so "contact the president" never
  // means scanning the seat map. isOfficer lets the district page keep
  // officers always visible while directors collapse behind an expander
  // once the roster grows.
  const ROLE_RANK: Record<string, number> = { President: 0, 'Vice President': 1, Treasurer: 2 };
  const people = [...members]
    .sort(
      (a, b) =>
        (ROLE_RANK[a.role ?? ''] ?? 9) - (ROLE_RANK[b.role ?? ''] ?? 9) ||
        (a.name ?? '').localeCompare(b.name ?? '')
    )
    .map((m) => ({ ...m, isOfficer: (ROLE_RANK[m.role ?? ''] ?? 9) < 9 }));

  return {
    townships: rows,
    people,
    atLarge,
    stats: {
      townshipCount: townshipNames.length,
      seatsTotal,
      seatsFilled,
      seatsOpen: seatsTotal - seatsFilled,
    },
    /** True when there is nothing at all to show yet. */
    empty: townshipNames.length === 0 && members.length === 0,
  };
}

export type BoardRoster = Awaited<ReturnType<typeof getBoardRoster>>;
export type TownshipRow = BoardRoster['townships'][number];
export type BoardMemberView = Member;
