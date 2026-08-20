import { defineType, defineField } from 'sanity';

export const officer = defineType({
  name: 'officer',
  title: 'Officer (department)',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'rank',
      title: 'Rank or title',
      type: 'string',
      description: 'For example: Fire Chief, Assistant Chief, Captain, Training Officer',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'yearsOfService',
      title: 'Years of service',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the photo for screen readers.',
        }),
      ],
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 10 }),
  ],
  orderings: [
    { title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'rank', media: 'photo' } },
});
