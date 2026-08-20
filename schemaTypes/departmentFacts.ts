import { defineType, defineField } from 'sanity';

/**
 * Department-owned facts, split from siteSettings per the by-owner rule
 * (the same reason District facts is its own document). Singleton, pinned
 * under The Department in the desk.
 */
export const departmentFacts = defineType({
  name: 'departmentFacts',
  title: 'Department facts',
  type: 'document',
  fields: [
    defineField({
      name: 'missionStatement',
      title: 'Mission statement',
      type: 'text',
      rows: 3,
      description:
        'Shown as its own block near the top of the Department page. A sentence or two; the block hides while this is empty.',
    }),
    defineField({
      name: 'foundedYear',
      title: 'Year founded',
      type: 'number',
      initialValue: 1962,
      validation: (r) => r.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'volunteerCount',
      title: 'Volunteer count',
      type: 'number',
      description: 'Approximate is fine; the site shows it as "~35". The stat hides while this is empty.',
      validation: (r) => r.positive().integer(),
    }),
    defineField({
      name: 'squareMiles',
      title: 'Square miles covered',
      type: 'number',
      description: 'The stat hides while this is empty.',
      validation: (r) => r.positive(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Department facts' }) },
});
