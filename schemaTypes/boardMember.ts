import { defineType, defineField } from 'sanity';

/**
 * A person on the district board. Create a document only for real people:
 * a township seat with no matching document shows as "Open" on the district
 * page automatically, so there are no placeholder documents to maintain and
 * vacancy can never disagree with reality.
 */
export const boardMember = defineType({
  name: 'boardMember',
  title: 'Board member (district)',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'role',
      title: 'Board role',
      type: 'string',
      description: 'Directors hold no extra office; the others are the board’s officers.',
      options: {
        list: [
          { title: 'President', value: 'President' },
          { title: 'Vice President', value: 'Vice President' },
          { title: 'Treasurer', value: 'Treasurer' },
          { title: 'Director', value: 'Director' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'township',
      title: 'Township represented',
      type: 'reference',
      to: [{ type: 'township' }],
      description:
        'Pick from the township list (add townships there first if one is missing). Leave empty for at-large members.',
    }),
    defineField({
      name: 'seat',
      title: 'Seat',
      type: 'string',
      description: 'Each township has a primary and a secondary seat.',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.email() }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description:
        'Any format works; the site displays it as (701) 555-0123. Leave empty if the member prefers not to publish a personal number.',
      validation: (r) =>
        r.custom((value) => {
          if (!value) return true;
          const digits = value.replace(/[^0-9]/g, '');
          if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) return true;
          return 'Enter a 10-digit phone number';
        }),
    }),
    defineField({
      name: 'preferredContact',
      title: 'Preferred contact method',
      type: 'string',
      description: 'Shown first on the site. Only needed when both are filled in.',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
        ],
        layout: 'radio',
      },
      hidden: ({ parent }) => !(parent?.email && parent?.phone),
      validation: (r) =>
        r.custom((value, context) => {
          const parent = context.parent as { email?: string; phone?: string } | undefined;
          if (parent?.email && parent?.phone && !value) return 'Pick which one residents should use first';
          return true;
        }),
    }),
    defineField({
      name: 'lastElected',
      title: 'Last elected (year)',
      type: 'number',
      description:
        'The year this member was elected or most recently re-elected. Shown on their card; update it after each election.',
      validation: (r) => r.integer().min(1950).max(2100),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first within a seat. Rarely needed; townships sort alphabetically.',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', role: 'role', township: 'township.name', seat: 'seat' },
    prepare: ({ title, role, township, seat }) => ({
      title,
      subtitle: [role, township ? `${township} · ${seat}` : 'At large'].filter(Boolean).join(' · '),
    }),
  },
});
