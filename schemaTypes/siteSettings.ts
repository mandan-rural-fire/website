import { defineType, defineField } from 'sanity';

/**
 * Site-wide settings that belong to the website itself: contact info and the
 * home page hero image. Singleton. Owner-specific settings live in their own
 * documents (Emergency alert, Meeting schedule, District facts, Department
 * facts).
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact', default: true },
    { name: 'media', title: 'Hero image' },
  ],
  fields: [
    defineField({
      name: 'phoneNonEmergency',
      title: 'Non-emergency phone',
      type: 'string',
      description: 'Any format works; the site displays it as (701) 663-6624.',
      validation: (r) =>
        r.custom((value: string | undefined) => {
          if (!value) return true;
          const digits = value.replace(/[^0-9]/g, '');
          if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) return true;
          return 'Enter a 10-digit phone number';
        }),
      group: 'contact',
    }),
    defineField({
      name: 'phoneStateRadio',
      title: 'ND State Radio phone',
      type: 'string',
      description: 'Any format works; the site displays it as (800) 472-2121.',
      validation: (r) =>
        r.custom((value: string | undefined) => {
          if (!value) return true;
          const digits = value.replace(/[^0-9]/g, '');
          if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) return true;
          return 'Enter a 10-digit phone number';
        }),
      group: 'contact',
    }),
    defineField({
      name: 'email',
      title: 'Department email',
      type: 'string',
      description:
        'Operations contact: footer Department column, the join page, and the accessibility statement.',
      validation: (r) => r.email(),
      group: 'contact',
    }),
    defineField({
      name: 'boardEmail',
      title: 'Board email',
      type: 'string',
      description:
        'District/board contact: the district page and the footer District column. Falls back to the department email while empty.',
      validation: (r) => r.email(),
      group: 'contact',
    }),


    defineField({
      name: 'heroImage',
      title: 'Home page hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      group: 'media',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
