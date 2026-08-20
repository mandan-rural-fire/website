import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';
import { deployTool } from './deployTool';
import { guideTool } from './guideTool';

// Singletons, pinned in the desk structure. Kept out of the global Create
// menu and stripped of duplicate/delete, otherwise a second document could
// exist and the [0] queries would pick one arbitrarily.
const SINGLETONS = ['siteSettings', 'alertBanner', 'meetingSchedule', 'districtFacts', 'departmentFacts'];

export default defineConfig({
  name: 'mandan-rural-fire',
  title: 'Mandan Rural Fire',
  projectId: 'ri0z6y8l',
  dataset: 'production',
  plugins: [structureTool({ structure })],
  tools: [deployTool, guideTool],
  // Plan-gated Studio features stay hidden: Releases and Scheduled
  // Publishing prompt for a paid plan, which the secretary should never
  // have to see or have explained. All three keys matter: the visible
  // tool registers on (releases.enabled || scheduledDrafts.enabled), and
  // scheduledDrafts defaults to true.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  scheduledPublishing: { enabled: false },
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) => prev.filter((t) => !SINGLETONS.includes(t.templateId)),
    actions: (prev, context) =>
      SINGLETONS.includes(context.schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete' && action !== 'unpublish')
        : prev,
  },
});
