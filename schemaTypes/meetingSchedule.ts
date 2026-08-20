import { defineType, defineField } from 'sanity';

/**
 * The board's recurring meeting rule. Singleton, shown next to Meetings in
 * the Studio. Every "next meeting" date on the site is computed from this;
 * individual meeting documents exist only once they have an agenda or
 * minutes.
 */
export const meetingSchedule = defineType({
  name: 'meetingSchedule',
  title: 'Meeting schedule',
  type: 'document',
  fields: [
    defineField({
      name: 'meetingWeekOfMonth',
      title: 'Week of the month',
      type: 'number',
      options: {
        list: [
          { title: 'First', value: 1 },
          { title: 'Second', value: 2 },
          { title: 'Third', value: 3 },
          { title: 'Fourth', value: 4 },
          { title: 'Last', value: -1 },
        ],
      },
      initialValue: 3,
    }),
    defineField({
      name: 'meetingWeekday',
      title: 'Day of the week',
      type: 'number',
      options: {
        list: [
          { title: 'Sunday', value: 0 },
          { title: 'Monday', value: 1 },
          { title: 'Tuesday', value: 2 },
          { title: 'Wednesday', value: 3 },
          { title: 'Thursday', value: 4 },
          { title: 'Friday', value: 5 },
          { title: 'Saturday', value: 6 },
        ],
      },
      initialValue: 3,
    }),
    defineField({
      name: 'meetingTime',
      title: 'Start time',
      type: 'string',
      description: 'As it should display, for example 7:00 PM.',
      initialValue: '7:00 PM',
    }),
    defineField({
      name: 'meetingLocation',
      title: 'Usual location',
      type: 'string',
      initialValue: 'Station 1, 3014 34th St NW, Mandan',
    }),
  ],
  preview: { prepare: () => ({ title: 'Meeting schedule' }) },
});
