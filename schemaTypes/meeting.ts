import { defineType, defineField } from 'sanity';
import { fetchMeetingRule, nextMeetingDefault } from './scheduleDefaults';

export const meeting = defineType({
  name: 'meeting',
  title: 'Meeting',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'agenda', title: 'Agenda' },
    { name: 'minutes', title: 'Minutes' },
  ],
  fields: [
    defineField({
      name: 'date',
      title: 'Meeting date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
      // Defaults to the next meeting per the rule in Site settings, so a
      // board schedule change reaches this without a code edit.
      initialValue: async (_params, context) => {
        const client = context.getClient({ apiVersion: '2026-07-01' });
        return nextMeetingDefault(await fetchMeetingRule(client));
      },
      validation: (r) => r.required(),
      group: 'details',
    }),
    defineField({
      name: 'title',
      title: 'Meeting title',
      type: 'string',
      description:
        'For example: Regular Board Meeting, or Special Meeting: mill levy informational',
      initialValue: 'Regular Board Meeting',
      validation: (r) => r.required(),
      group: 'details',
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: (doc: Record<string, unknown>) => `${doc.date ?? ''}-${doc.title ?? ''}`,
        maxLength: 96,
      },
      validation: (r) => r.required(),
      group: 'details',
    }),
    defineField({
      name: 'time',
      title: 'Start time',
      type: 'string',
      initialValue: '7:00 PM',
      group: 'details',
    }),
    defineField({
      name: 'locationType',
      title: 'Location',
      type: 'string',
      options: {
        list: [
          { title: 'A station', value: 'station' },
          { title: 'Somewhere else', value: 'other' },
        ],
        layout: 'radio',
      },
      initialValue: 'station',
      group: 'details',
    }),
    defineField({
      name: 'station',
      title: 'Station',
      type: 'reference',
      to: [{ type: 'station' }],
      hidden: ({ parent }) => parent?.locationType !== 'station',
      validation: (r) =>
        r.custom((value, context) => {
          const parent = context.parent as { locationType?: string } | undefined;
          if (parent?.locationType === 'station' && !value) return 'Pick a station';
          return true;
        }),
      group: 'details',
    }),
    defineField({
      name: 'otherLocation',
      title: 'Location',
      type: 'string',
      description: 'For example: Morton County Courthouse, or a community hall',
      hidden: ({ parent }) => parent?.locationType !== 'other',
      validation: (r) =>
        r.custom((value, context) => {
          const parent = context.parent as { locationType?: string } | undefined;
          if (parent?.locationType === 'other' && !value) return 'Enter a location';
          return true;
        }),
      group: 'details',
    }),

    // AGENDA: published before the meeting
    defineField({
      name: 'agendaBody',
      title: 'Agenda',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Paste the agenda from Word. Publish this before the meeting.',
      group: 'agenda',
    }),
    defineField({
      name: 'agendaPdf',
      title: 'Agenda PDF',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'Optional. The official copy, offered as a download.',
      group: 'agenda',
    }),

    // MINUTES: published after the meeting
    defineField({
      name: 'minutesBody',
      title: 'Minutes',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Paste the minutes from Word after the meeting. Leave empty until they exist.',
      group: 'minutes',
    }),
    defineField({
      name: 'minutesPdf',
      title: 'Signed minutes PDF',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'Optional. The signed copy of record, offered as a download.',
      group: 'minutes',
    }),
    defineField({
      name: 'minutesStatus',
      title: 'Minutes status',
      type: 'string',
      description: 'For example: Approved June 9, 2026. Leave empty if not yet approved.',
      group: 'minutes',
    }),
  ],
  orderings: [
    { title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Date, oldest first', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'date', status: 'minutesStatus', minutes: 'minutesBody' },
    prepare({ title, date, status, minutes }) {
      const hasMinutes = Array.isArray(minutes) && minutes.length > 0;
      return {
        title: `${date ?? 'No date'} ${title ?? ''}`.trim(),
        subtitle: hasMinutes ? status || 'Minutes posted, not yet approved' : 'Agenda only',
      };
    },
  },
});
