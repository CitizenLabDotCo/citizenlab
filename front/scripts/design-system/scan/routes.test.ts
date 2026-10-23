import path from 'path';

import { isScannedSource, mapRoutes, SourceTree } from './routes';
import { libraryIndex, libraryUsages, usagesInFile } from './usages';

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

describe('app component roots (components/UI, components/admin)', () => {
  const sources: Record<string, string> = {
    'app/component-library/index.tsx':
      "import Error from './components/Error';\nexport { Error };",
    'app/component-library/components/Error/index.tsx':
      'const Error = () => null;\nexport default Error;',
    'app/components/UI/Warning/index.tsx':
      "import Icon from './Icon';\nconst Warning = () => <Icon />;\nexport default Warning;",
    'app/components/UI/Warning/Icon.tsx':
      'const Icon = () => null;\nexport default Icon;',
    'app/components/UI/Error/index.tsx':
      'const Error = () => null;\nexport default Error;',
    'app/components/admin/Section/index.tsx':
      'export const Section = () => null;\nexport const sectionProps = {};',
    'app/components/UI/NoIndex/Thing.tsx':
      'const Thing = () => null;\nexport default Thing;',
    'app/components/UI/loose.tsx': 'export const Loose = () => null;',
    'app/containers/Page.tsx': [
      "import Warning from 'components/UI/Warning';",
      "import UIError from 'components/UI/Error';",
      "import { Error } from '@citizenlab/cl2-component-library';",
      "import { Section, sectionProps } from 'components/admin/Section';",
      "import Thing from 'components/UI/NoIndex/Thing';",
      "import { Loose } from 'components/UI/loose';",
      'export default () => (',
      '  <Section {...sectionProps}>',
      '    <Warning tone="info" />',
      '    <UIError /><Error /><Thing /><Loose />',
      '  </Section>',
      ');',
    ].join('\n'),
  };
  const tree = new SourceTree('/nonexistent', Object.keys(sources));
  Object.entries(sources).forEach(([f, src]) => tree.setSource(f, src));
  const lib = libraryIndex(tree);

  it('counts one component per directory with an index file', () => {
    expect([...lib.ownFiles.keys()].sort()).toEqual([
      'Error',
      'Section',
      'UI/Error',
      'Warning',
    ]);
    expect(lib.ownFiles.get('Warning')).toEqual([
      'app/components/UI/Warning/Icon.tsx',
      'app/components/UI/Warning/index.tsx',
    ]);
    expect(lib.mainFile.get('Warning')).toBe(
      'app/components/UI/Warning/index.tsx'
    );
    expect(lib.componentOfFile('app/components/UI/NoIndex/Thing.tsx')).toBe(
      undefined
    );
  });

  it('records usages of app components, prefixing names the library has', () => {
    expect(usagesInFile(tree, lib, 'app/containers/Page.tsx')).toEqual([
      {
        component: 'Warning',
        file: 'app/containers/Page.tsx',
        line: 1,
        props: ['tone'],
      },
      {
        component: 'UI/Error',
        file: 'app/containers/Page.tsx',
        line: 2,
        props: [],
      },
      {
        component: 'Error',
        file: 'app/containers/Page.tsx',
        line: 3,
        props: [],
      },
      {
        component: 'Section',
        file: 'app/containers/Page.tsx',
        line: 4,
        props: [],
      },
    ]);
  });

  it('does not count a component using its own files', () => {
    expect(
      usagesInFile(tree, lib, 'app/components/UI/Warning/index.tsx')
    ).toEqual([]);
  });
  it('prefixes both names when UI and admin have a folder of the same name', () => {
    const files: Record<string, string> = {
      'app/components/UI/Tabs/index.tsx': 'export default () => null;',
      'app/components/admin/Tabs/index.tsx': 'export default () => null;',
      'app/containers/Tabs.tsx': [
        "import UITabs from 'components/UI/Tabs';",
        "import AdminTabs from 'components/admin/Tabs';",
        'export default () => <><UITabs /><AdminTabs /></>;',
      ].join('\n'),
    };
    const clashTree = new SourceTree('/nonexistent', Object.keys(files));
    Object.entries(files).forEach(([f, src]) => clashTree.setSource(f, src));
    const clashLib = libraryIndex(clashTree);
    expect([...clashLib.ownFiles.keys()].sort()).toEqual([
      'UI/Tabs',
      'admin/Tabs',
    ]);
    expect(
      usagesInFile(clashTree, clashLib, 'app/containers/Tabs.tsx').map(
        (u) => u.component
      )
    ).toEqual(['UI/Tabs', 'admin/Tabs']);
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

describe('route closure and imports used only as types', () => {
  // A plain `import { X }` whose names appear only in type positions is
  // erased by TypeScript, so the imported module is not rendered there.
  const sources: Record<string, string> = {
    'app/routes.tsx': [
      "import { lazy } from 'react';",
      "import { createRoute, createRootRoute, Outlet } from '@tanstack/react-router';",
      "const Page = lazy(() => import('containers/Page'));",
      'const rootRoute = createRootRoute({ component: Outlet });',
      'const pageRoute = createRoute({',
      '  getParentRoute: () => rootRoute,',
      "  path: 'page',",
      '  component: Page,',
      '});',
      'export const routeTree = rootRoute.addChildren([pageRoute]);',
    ].join('\n'),
    'app/containers/Page.tsx': [
      "import React, { useState } from 'react';",
      "import { ButtonProps } from 'components/UI/Button';",
      "import Error, { ErrorProps } from 'components/UI/Error';",
      "import { Tip } from 'components/UI/Tip';",
      "import { Shape } from 'components/UI/Shape';",
      "import { Model } from 'components/UI/Model';",
      "import { Widget } from 'components/UI/Widget';",
      "import Thing from 'components/UI/Thing';",
      "import type { Typed } from 'components/UI/Typed';",
      "import 'components/UI/Side';",
      'type Props = ButtonProps & { shape: typeof Shape; e?: ErrorProps; t?: Typed };',
      'interface More extends ButtonProps { x: number }',
      'const Page = (props: Props): More | null => {',
      '  const [m] = useState<Model>();',
      '  const tip = props as unknown as Tip;',
      '  return <Error name={Widget.displayName} m={m} tip={tip} />;',
      '};',
      'export { Thing };',
      'export default Page;',
    ].join('\n'),
    ...Object.fromEntries(
      [
        'Button',
        'Error',
        'Tip',
        'Shape',
        'Model',
        'Widget',
        'Thing',
        'Typed',
        'Side',
      ].map((n) => [
        `app/components/UI/${n}/index.tsx`,
        `export const ${n} = 1;\nexport type ${n}Props = {};\nexport default ${n};`,
      ])
    ),
  };
  const tree = new SourceTree('/nonexistent', Object.keys(sources));
  Object.entries(sources).forEach(([f, src]) => tree.setSource(f, src));

  it('leaves out modules whose imports are used only as types', () => {
    const result = mapRoutes('/nonexistent', tree);
    expect(result.routeFiles['page']).toEqual([
      'app/components/UI/Error/index.tsx',
      'app/components/UI/Side/index.tsx',
      'app/components/UI/Thing/index.tsx',
      'app/components/UI/Widget/index.tsx',
      'app/containers/Page.tsx',
    ]);
  });

  it('marks each import name by whether the file uses it as a value', () => {
    const page = tree.importsOf('app/containers/Page.tsx');
    const names = Object.fromEntries(
      page.flatMap((i) => i.names).map((n) => [n.local, n.typeOnly])
    );
    expect(names).toEqual({
      React: false, // the file has JSX
      useState: false,
      ButtonProps: true,
      Error: false,
      ErrorProps: true,
      Tip: true,
      Shape: true,
      Model: true,
      Widget: false,
      Thing: false,
      Typed: true,
    });
  });
});
