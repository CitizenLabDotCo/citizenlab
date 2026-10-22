import path from 'path';

import { isScannedSource, mapRoutes, SourceTree } from './routes';
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

  it('follows named imports through the library barrel, not the whole barrel', () => {
    // The phase page imports { Box, colors } from the barrel, which also
    // exports Accordion: only Box and styleUtils are rendered there.
    const all = Object.values(result.routeFiles).flat();
    expect(all).not.toContain(
      'app/component-library/components/Accordion/index.tsx'
    );
    expect(all).not.toContain('app/component-library/index.tsx');
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

describe('isScannedSource', () => {
  it('skips the generated token module, which defines tokens', () => {
    expect(isScannedSource('app/design-system/tokens/tokens.ts')).toBe(false);
    expect(isScannedSource('app/design-system/Mode.tsx')).toBe(true);
  });
});

describe('SourceTree.barrel', () => {
  const tree = (sources: Record<string, string>) => {
    const t = new SourceTree('/nonexistent', Object.keys(sources));
    Object.entries(sources).forEach(([f, src]) => t.setSource(f, src));
    return t;
  };

  it('maps exported names to the files that define them', () => {
    const t = tree({
      'app/lib/index.ts': [
        "import A from './a';",
        "import { b as B } from './b';",
        "export { default as C } from './c';",
        "export * from './d';",
        'export type { T } from "./a";',
        'export { A, B };',
      ].join('\n'),
      'app/lib/a.ts': 'export default 1; export type T = 1;',
      'app/lib/b.ts': 'export const b = 1;',
      'app/lib/c.ts': 'export default 1;',
      'app/lib/d.ts': 'export const d = 1;',
    });
    const info = t.barrel('app/lib/index.ts');
    expect(info && Object.fromEntries(info.named)).toEqual({
      A: { file: 'app/lib/a.ts', name: 'default' },
      B: { file: 'app/lib/b.ts', name: 'b' },
      C: { file: 'app/lib/c.ts', name: 'default' },
    });
    expect(info?.stars).toEqual(['app/lib/d.ts']);
    expect([...(info?.types ?? [])]).toEqual(['T']);
  });

  it('is null for a module with code of its own', () => {
    const t = tree({
      'app/lib/index.ts': "import A from './a';\nexport const x = A + 1;",
      'app/lib/a.ts': 'export default 1;',
    });
    expect(t.barrel('app/lib/index.ts')).toBeNull();
  });
});
