import { defineQuery } from 'groq';

// Every query is wrapped in defineQuery so Sanity TypeGen can find it and emit
// a matching *_QUERY_RESULT type in sanity.types.ts. Never hand-write those.

export const MEETINGS_QUERY = defineQuery(`*[_type == "meeting"] | order(date desc){
  "slug": slug.current,
  date, title, time, locationType, otherLocation,
  "stationName": station->name,
  "stationAddress": station->address,
  agendaBody, minutesBody, minutesStatus,
  "agendaPdfUrl": agendaPdf.asset->url,
  "minutesPdfUrl": minutesPdf.asset->url
}`);

export const BOARD_QUERY = defineQuery(`*[_type == "boardMember"] | order(order asc){
  name, role, email, phone, preferredContact, lastElected,
  "township": township->name
}`);

export const TOWNSHIPS_QUERY = defineQuery(`*[_type == "township"] | order(name asc){
  name
}`);

export const UPCOMING_VOTES_QUERY = defineQuery(`*[_type == "vote" && date >= $today] | order(date asc){
  title, date, summary, votingInfo, link
}`);

export const PAST_VOTES_QUERY = defineQuery(`*[_type == "vote" && date < $today] | order(date desc){
  title, date, summary, outcome, resultSummary
}`);

export const OFFICERS_QUERY = defineQuery(`*[_type == "officer"] | order(order asc){
  name, rank, yearsOfService, photo
}`);

export const STATIONS_QUERY = defineQuery(`*[_type == "station"] | order(order asc){
  _id, name, address, mailingAddress, isHeadquarters, photo, notes,
  "apparatus": *[_type == "apparatus" && station._ref == ^._id] | order(order asc){
    _id, name, unitType, year, chassis, tankCapacity, pumpCapacity, notes, photo
  }
}`);

export const PREVENTION_QUERY = defineQuery(`*[_type == "preventionTopic"] | order(order asc){
  _id, title, "slug": slug.current, kicker, summary,
  cards[]{ heading, points }
}`);

export const HAPPENINGS_QUERY = defineQuery(`*[_type == "happening"] | order(date desc)[0...$limit]{
  title, caption, photo
}`);

export const SEASONAL_TIPS_QUERY =
  defineQuery(`*[_type == "seasonalTip" && season == $season] | order(order asc){
  tip
}`);

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  phoneNonEmergency, phoneStateRadio, email, boardEmail,
  heroImage
}`);

export const ALERT_QUERY = defineQuery(`*[_type == "alertBanner"][0]{
  alertEnabled, alertLevel, alertTag, alertMessage
}`);

export const SCHEDULE_QUERY = defineQuery(`*[_type == "meetingSchedule"][0]{
  meetingWeekOfMonth, meetingWeekday, meetingTime, meetingLocation
}`);

export const DEPARTMENT_FACTS_QUERY = defineQuery(`*[_type == "departmentFacts"][0]{
  missionStatement, foundedYear, volunteerCount, squareMiles
}`);

export const DISTRICT_FACTS_QUERY = defineQuery(`*[_type == "districtFacts"][0]{
  millRate, districtMailing, fundingNoteTitle, fundingNote
}`);
