import { defineType, defineField } from 'sanity';

export const apparatus = defineType({
  name: 'apparatus',
  title: 'Apparatus',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Unit name',
      type: 'string',
      description: 'For example: Engine 1, Tender 2',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'unitType',
      title: 'Type',
      type: 'string',
      options: {
        list: ['Engine', 'Tender', 'Brush / Grass', 'Rescue', 'Command', 'Support', 'Other'],
      },
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (r) => r.integer().min(1900).max(2100),
    }),
    defineField({ name: 'chassis', title: 'Chassis / make', type: 'string' }),
    defineField({
      name: 'tankCapacity',
      title: 'Tank capacity (gallons)',
      type: 'number',
      validation: (r) => r.positive(),
    }),
    defineField({
      name: 'pumpCapacity',
      title: 'Pump capacity (GPM)',
      type: 'number',
      validation: (r) => r.positive(),
    }),
    defineField({
      name: 'station',
      title: 'Assigned station',
      type: 'reference',
      to: [{ type: 'station' }],
    }),
    defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 3 }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 10 }),
  ],
  orderings: [
    { title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', unitType: 'unitType', year: 'year', media: 'photo' },
    prepare: ({ title, unitType, year, media }) => ({
      title,
      subtitle: [year, unitType].filter(Boolean).join(' \u00B7 '),
      media,
    }),
  },
});
