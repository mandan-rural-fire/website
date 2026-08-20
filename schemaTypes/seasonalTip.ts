import { defineType, defineField } from 'sanity';

export const seasonalTip = defineType({
  name: 'seasonalTip',
  title: 'Seasonal safety tip',
  type: 'document',
  fields: [
    defineField({
      name: 'season',
      title: 'Season',
      type: 'string',
      options: {
        list: [
          { title: 'Spring', value: 'Spring' },
          { title: 'Summer', value: 'Summer' },
          { title: 'Fall', value: 'Fall' },
          { title: 'Winter', value: 'Winter' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tip',
      title: 'Tip',
      type: 'text',
      rows: 3,
      description: 'One sentence. These rotate on the home page during the matching season.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 10 }),
  ],
  orderings: [
    {
      title: 'Season, then order',
      name: 'seasonOrder',
      by: [
        { field: 'season', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: { select: { title: 'tip', subtitle: 'season' } },
});
