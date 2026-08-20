import { defineType, defineField } from 'sanity';

/**
 * District (funding body) facts. Singleton, shown with the board content in
 * the Studio. Figures here are never guessed by the site: an empty field
 * hides its stat rather than showing a made-up number.
 */
export const districtFacts = defineType({
  name: 'districtFacts',
  title: 'District facts',
  type: 'document',
  fields: [
    defineField({
      name: 'millRate',
      title: 'Current mill rate',
      type: 'number',
      description:
        'Just the number, for example 4.9. Shown as "currently 4.9 mills" on the district page; the sentence hides while this is empty.',
      validation: (r) => r.positive(),
    }),
    defineField({
      name: 'districtMailing',
      title: 'District mailing address',
      type: 'text',
      rows: 4,
      description: 'One line per row, exactly as it should appear in the footer.',
    }),
    defineField({
      name: 'fundingNoteTitle',
      title: 'Funding news headline',
      type: 'string',
      description: 'For example: 2026 levy vote. Shown in bold at the start of the note.',
    }),
    defineField({
      name: 'fundingNote',
      title: 'Funding news',
      type: 'text',
      rows: 5,
      description:
        'Time-sensitive funding news (a levy vote, a budget decision) shown in a highlighted box on the district page. Update it when things change; clear it and the box disappears.',
    }),
  ],
  preview: { prepare: () => ({ title: 'District facts' }) },
});
