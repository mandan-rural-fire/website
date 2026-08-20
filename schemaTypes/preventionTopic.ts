import { defineType, defineField } from 'sanity';

/**
 * A prevention page section: a headed group of tip cards, each card a short
 * heading with bullet points. Topics render as alternating bands with jump
 * links at the top of the page.
 */
export const preventionTopic = defineType({
  name: 'preventionTopic',
  title: 'Prevention topic',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The section heading. For example: Structure fire safety',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Anchor',
      type: 'slug',
      options: { source: 'title' },
      description: 'Used by the jump links at the top of the prevention page. Click Generate.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'The small gold line above the heading. For example: In and around the home',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      description: 'Optional sentence or two under the heading.',
    }),
    defineField({
      name: 'cards',
      title: 'Tip cards',
      type: 'array',
      description: 'Each card is a short heading with bullet points. Two cards per row on desktop.',
      of: [
        {
          type: 'object',
          name: 'tipCard',
          title: 'Tip card',
          fields: [
            defineField({
              name: 'heading',
              title: 'Card heading',
              type: 'string',
              description: 'For example: Smoke & CO alarms',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'points',
              title: 'Points',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'One short line per point.',
              validation: (r) => r.min(1),
            }),
          ],
          preview: {
            select: { title: 'heading', points: 'points' },
            prepare: ({ title, points }) => ({
              title,
              subtitle: `${points?.length ?? 0} points`,
            }),
          },
        },
      ],
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 10 }),
  ],
  orderings: [
    { title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'kicker' } },
});
