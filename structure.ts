import type { StructureResolver } from 'sanity/structure';

/**
 * Desk structure, organized by owner so a non-technical editor can navigate
 * by task: the emergency alert on top (most urgent), then board things with
 * board things, department things with department things, website last.
 * Singletons are pinned to one document each; creation of seconds is
 * blocked in sanity.config.ts.
 */
const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type));

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      singleton(S, 'alertBanner', 'Emergency alert'),
      S.divider().title('The District'),
      S.documentTypeListItem('meeting').title('Meetings'),
      singleton(S, 'meetingSchedule', 'Meeting schedule'),
      S.documentTypeListItem('boardMember').title('Board members'),
      S.documentTypeListItem('vote').title('Votes'),
      S.documentTypeListItem('township').title('Townships'),
      singleton(S, 'districtFacts', 'District facts'),
      S.divider().title('The Department'),
      S.documentTypeListItem('officer').title('Officers'),
      S.documentTypeListItem('station').title('Stations'),
      S.documentTypeListItem('apparatus').title('Apparatus'),
      singleton(S, 'departmentFacts', 'Department facts'),
      S.divider().title('Website'),
      singleton(S, 'siteSettings', 'Site settings'),
      S.documentTypeListItem('preventionTopic').title('Prevention topics'),
      S.documentTypeListItem('seasonalTip').title('Seasonal tips'),
      S.documentTypeListItem('happening').title('Happenings'),
    ]);
