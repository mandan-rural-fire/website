import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: 'ri0z6y8l', dataset: 'production' },
  typegen: {
    schema: './schema.json',
    path: './src/**/*.{ts,astro}',
    generates: './src/lib/sanity.types.ts',
  },
});
