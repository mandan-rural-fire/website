import { sanityClient } from './client';
import {
  ALERT_QUERY,
  BOARD_QUERY,
  DISTRICT_FACTS_QUERY,
  DEPARTMENT_FACTS_QUERY,
  HAPPENINGS_QUERY,
  MEETINGS_QUERY,
  OFFICERS_QUERY,
  PREVENTION_QUERY,
  SCHEDULE_QUERY,
  SEASONAL_TIPS_QUERY,
  SETTINGS_QUERY,
  STATIONS_QUERY,
  TOWNSHIPS_QUERY,
  UPCOMING_VOTES_QUERY,
  PAST_VOTES_QUERY,
} from './queries';

// Thin wrappers. Return types are inferred from the generated query types, so
// nothing here is hand-annotated. Derive item types with:
//   type BoardMember = Awaited<ReturnType<typeof getBoardMembers>>[number]
//
// Memoized for the build: the layout, banners, and every page call these
// independently, which fired the same query dozens of times per build. One
// process is one build, so caching the promise is safe. This does not replace
// useCdn:false on the client; that stays so a webhook-triggered rebuild sees
// just-published content instead of a stale CDN result.

// Production builds only: the dev server keeps modules (and this cache)
// alive across requests, which would pin content to whenever it started.
const memoEnabled = import.meta.env.PROD;

const memo = new Map<string, Promise<unknown>>();
function once<T>(key: string, run: () => Promise<T>): Promise<T> {
  if (!memoEnabled) return run();
  let p = memo.get(key) as Promise<T> | undefined;
  if (!p) {
    p = run();
    memo.set(key, p);
  }
  return p;
}

export const getMeetingsRaw = () => once('meetings', () => sanityClient.fetch(MEETINGS_QUERY));
export const getBoardMembers = () => once('board', () => sanityClient.fetch(BOARD_QUERY));
export const getTownships = () => once('townships', () => sanityClient.fetch(TOWNSHIPS_QUERY));
// Build-time "upcoming": votes on or after the build date. VoteCard also
// hides past votes client-side so a card cannot linger between rebuilds.
export const getUpcomingVotes = () =>
  once('votes', () => sanityClient.fetch(UPCOMING_VOTES_QUERY, { today: new Date().toISOString().slice(0, 10) }));
export const getPastVotes = () =>
  once('pastVotes', () => sanityClient.fetch(PAST_VOTES_QUERY, { today: new Date().toISOString().slice(0, 10) }));
export const getOfficers = () => once('officers', () => sanityClient.fetch(OFFICERS_QUERY));
export const getStationsWithApparatus = () =>
  once('stations', () => sanityClient.fetch(STATIONS_QUERY));
export const getPreventionTopics = () =>
  once('prevention', () => sanityClient.fetch(PREVENTION_QUERY));
export const getHappenings = (limit = 3) =>
  once(`happenings:${limit}`, () => sanityClient.fetch(HAPPENINGS_QUERY, { limit }));
export const getSeasonalTips = (season: string) =>
  once(`tips:${season}`, () => sanityClient.fetch(SEASONAL_TIPS_QUERY, { season }));
export const getSettings = () => once('settings', () => sanityClient.fetch(SETTINGS_QUERY));
export const getAlertBanner = () => once('alert', () => sanityClient.fetch(ALERT_QUERY));
export const getMeetingSchedule = () => once('schedule', () => sanityClient.fetch(SCHEDULE_QUERY));
export const getDistrictFacts = () => once('districtFacts', () => sanityClient.fetch(DISTRICT_FACTS_QUERY));
export const getDepartmentFacts = () => once('departmentFacts', () => sanityClient.fetch(DEPARTMENT_FACTS_QUERY));

// Item types, derived rather than declared. Adding a field to a query updates
// these automatically after the next `yarn typegen`.
export type BoardMember = Awaited<ReturnType<typeof getBoardMembers>>[number];
export type Officer = Awaited<ReturnType<typeof getOfficers>>[number];
export type Station = Awaited<ReturnType<typeof getStationsWithApparatus>>[number];
export type Apparatus = Station['apparatus'][number];
export type PreventionTopic = Awaited<ReturnType<typeof getPreventionTopics>>[number];
export type Happening = Awaited<ReturnType<typeof getHappenings>>[number];
export type Settings = Awaited<ReturnType<typeof getSettings>>;
export type MeetingScheduleDoc = Awaited<ReturnType<typeof getMeetingSchedule>>;
export type DistrictFacts = Awaited<ReturnType<typeof getDistrictFacts>>;
export type DepartmentFacts = Awaited<ReturnType<typeof getDepartmentFacts>>;
