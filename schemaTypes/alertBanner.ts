import { defineType, defineField } from 'sanity';

/**
 * The manual emergency alert banner. Singleton, pinned at the top of the
 * Studio because it is the most urgent thing an editor ever touches. Only
 * for what the automatic sources do not cover: NWS Red Flag Warnings and
 * the county burn ban banner appear on their own.
 */
export const alertBanner = defineType({
  name: 'alertBanner',
  title: 'Emergency alert',
  type: 'document',
  fields: [
    defineField({
      name: 'alertEnabled',
      title: 'Show the alert banner',
      type: 'boolean',
      description:
        'Red Flag Warnings and county burn bans appear automatically; this is for anything else residents need to see site-wide.',
      initialValue: false,
    }),
    defineField({
      name: 'alertLevel',
      title: 'Alert level',
      type: 'string',
      options: {
        list: [
          { title: 'Red (most severe)', value: 'redflag' },
          { title: 'Amber (advisory)', value: 'burnban' },
        ],
        layout: 'radio',
      },
      initialValue: 'burnban',
    }),
    defineField({
      name: 'alertTag',
      title: 'Alert label',
      type: 'string',
      description: 'For example: Road Closure',
    }),
    defineField({
      name: 'alertMessage',
      title: 'Alert message',
      type: 'text',
      rows: 2,
      description: 'The sentence shown in the banner. Required while the banner is enabled.',
      validation: (r) =>
        r.custom((value, context) => {
          const doc = context.document as { alertEnabled?: boolean } | undefined;
          if (doc?.alertEnabled && !value) return 'Enter the message to show, or turn the banner off';
          return true;
        }),
    }),
  ],
  preview: {
    select: { enabled: 'alertEnabled', tag: 'alertTag' },
    prepare: ({ enabled, tag }) => ({
      title: 'Emergency alert',
      subtitle: enabled ? `ON: ${tag ?? 'no label'}` : 'Off',
    }),
  },
});
