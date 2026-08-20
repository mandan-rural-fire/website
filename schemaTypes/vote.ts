import { defineType, defineField } from 'sanity';

/**
 * A public vote on a district question (a levy change, a ballot measure).
 * NOT director elections; those happen at the annual meeting and live in
 * its minutes. Create one when a vote is scheduled: it is highlighted on
 * the home and district pages until voting day, then moves to the district
 * page's past-votes record, where the outcome fields show what happened.
 */
export const vote = defineType({
  name: 'vote',
  title: 'Vote',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'What is being voted on',
      type: 'string',
      description: 'For example: Special election on the fire protection levy',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Voting day',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'What residents are deciding, in plain terms. One short paragraph.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'votingInfo',
      title: 'Where and how to vote',
      type: 'text',
      rows: 3,
      description: 'Polling place, hours, absentee info. Shown under the summary.',
    }),
    defineField({
      name: 'link',
      title: 'Official notice link',
      type: 'url',
      description: 'Optional link to the official notice or county page.',
    }),
    defineField({
      name: 'outcome',
      title: 'Outcome',
      type: 'string',
      description: 'Fill in after voting day; shows in the past-votes record on the district page.',
      options: {
        list: [
          { title: 'Passed', value: 'passed' },
          { title: 'Failed', value: 'failed' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'resultSummary',
      title: 'Result summary',
      type: 'text',
      rows: 3,
      description: 'The tally and what happens next. For example: Voters rejected the measure, 48 to 443. The board is reviewing next steps.',
    }),
  ],
  orderings: [{ title: 'Voting day', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', date: 'date' },
    prepare: ({ title, date }) => ({ title, subtitle: date ?? 'No date set' }),
  },
});
