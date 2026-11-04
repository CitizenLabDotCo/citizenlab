// The a11y.json checklists of the library, bundled at build time (Vite
// reads them from app/component-library/components/<Name>/a11y.json), keyed
// by the component's directory. Kept apart from a11y.ts so its tests do not
// need Vite's import.meta.glob.
import { checklistsByDir } from './a11y';

export const CHECKLISTS = checklistsByDir(
  import.meta.glob('../../../../app/component-library/components/*/a11y.json', {
    eager: true,
    import: 'default',
  })
);
