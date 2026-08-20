import { defineType, defineField } from 'sanity';

export const station = defineType({
  name: 'station',
  title: 'Station',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'For example: Station 1',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
      description: 'Street address on one line, for example 3014 34th St NW, Mandan, ND 58554.',
    }),
    defineField({
      name: 'mailingAddress',
      title: 'Mailing address',
      type: 'string',
      description:
        'Only on the Headquarters station: where department mail goes when the street address does not receive it, for example PO Box 187. Shown as a "Mail:" line in the site footer; leave empty and the line disappears.',
    }),
    defineField({
      name: 'isHeadquarters',
      title: 'Headquarters',
      type: 'boolean',
      description: 'The main station. Its address also appears in the site footer.',
      initialValue: false,
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 3 }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 10 }),
  ],
  orderings: [
    { title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'name', subtitle: 'address', media: 'photo' } },
});
