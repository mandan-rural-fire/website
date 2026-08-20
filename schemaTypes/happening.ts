import { defineType, defineField } from 'sanity';

export const happening = defineType({
  name: 'happening',
  title: 'Happening',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'Used for ordering. The newest three appear on the home page.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 3,
      description: 'One or two sentences.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'date', media: 'photo' } },
});
