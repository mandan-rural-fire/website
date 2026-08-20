import { defineType, defineField } from 'sanity';

/**
 * A township the district spans. The canonical list: board members reference
 * these, and any township with fewer than two members shows its remaining
 * seats as open on the district page automatically. Add each township once;
 * there is nothing else to maintain here.
 */
export const township = defineType({
  name: 'township',
  title: 'Township',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'For example: Sweet Briar. Shown as the card title on the district page.',
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'name' } },
});
