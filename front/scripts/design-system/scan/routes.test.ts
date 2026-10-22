import path from 'path';

import { mapRoutes } from './routes';
import { libraryUsages } from './usages';

const ROOT = path.join(__dirname, '..', 'fixtures', 'routes');

describe('mapRoutes', () => {
  const result = mapRoutes(ROOT);

  it('joins nested paths, keeps $params and drops the $locale segment', () => {
    expect(result.routes).toEqual([
      {
        path: '',
        office: 'public',
        file: 'app/containers/HomePage/index.tsx',
      },
      {
        path: 'admin',
        office: 'admin',
        file: 'app/containers/Admin/index.tsx',
      },
      {
        path: 'admin/projects/$projectId/phases/$phaseId',
        office: 'admin',
        file: 'app/containers/Admin/projects/project/phase/index.tsx',
      },
      {
        path: 'admin/tools/widgets',
        office: 'admin',
        file: 'app/modules/commercial/widgets/admin/Widgets.tsx',
      },
    ]);
  });

  it('maps a route to the import closure of its lazy page, stopping at route files', () => {
    expect(
      result.routeFiles['admin/projects/$projectId/phases/$phaseId']
    ).toEqual([
      'app/component-library/components/Box/index.tsx',
      'app/component-library/index.tsx',
      'app/component-library/utils/styleUtils.ts',
      'app/containers/Admin/projects/project/phase/Tabs.tsx',
      'app/containers/Admin/projects/project/phase/index.tsx',
    ]);
    expect(result.routeFiles['']).toEqual([
      'app/component-library/components/Box/index.tsx',
      'app/components/Hero/index.tsx',
      'app/containers/HomePage/index.tsx',
    ]);
  });

  it('lists a file that no route imports (an orphan component) as unmapped', () => {
    expect(result.unmapped).toContain('app/components/Orphan/index.tsx');
    expect(result.unmapped).not.toContain(
      'app/containers/Admin/projects/project/phase/Tabs.tsx'
    );
    expect(result.unmapped).toEqual([...result.unmapped].sort());
  });

  it('reports a lazy import whose target does not exist and maps no route for it', () => {
    expect(result.unresolvedImports).toEqual([
      'app/containers/Admin/projects/routes.tsx: ./project/missing',
    ]);
    expect(result.routes.map((r) => r.path)).not.toContain(
      'admin/projects/missing'
    );
  });

  it('ignores module routes under keys the route tree does not wire', () => {
    expect(result.routes.map((r) => r.path)).not.toContain('widgets/$widgetId');
  });
});

describe('libraryUsages', () => {
  it('records library imports through the alias and deep paths, with props', () => {
    const phase = libraryUsages(
      ROOT,
      'app/containers/Admin/projects/project/phase/index.tsx'
    );
    // `colors` is a library export but not a component.
    expect(phase).toEqual([
      {
        component: 'Box',
        file: 'app/containers/Admin/projects/project/phase/index.tsx',
        line: 3,
        props: ['mb', 'p'],
      },
    ]);
    expect(libraryUsages(ROOT, 'app/components/Hero/index.tsx')).toEqual([
      {
        component: 'Box',
        file: 'app/components/Hero/index.tsx',
        line: 3,
        props: ['p'],
      },
    ]);
  });

  it('skips type-only imports and imports never used as values', () => {
    const src = [
      "import type { BoxProps } from '@citizenlab/cl2-component-library';",
      "import { Box } from '@citizenlab/cl2-component-library';",
      'export const f = (p: BoxProps): Box => p as any;',
    ].join('\n');
    expect(libraryUsages(ROOT, 'app/components/X.tsx', src)).toEqual([]);
  });
});
