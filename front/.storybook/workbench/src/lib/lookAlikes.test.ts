import {
  formatMergeTask,
  lookAlikeOf,
  lookAlikesFor,
  routesOfFile,
} from './lookAlikes';

import type { Finding, ScanOutput } from './data';

const styled = (file: string, line: number, raw: string, component?: string) =>
  ({
    file,
    line,
    col: 1,
    raw,
    category: 'styled-block',
    confidence: 'high',
    component,
  } as Finding);

const scan = (
  findings: Finding[],
  routes: ScanOutput['routes'] = [],
  components: unknown[] = []
) => ({ findings, routes, components } as unknown as ScanOutput);

describe('lookAlikeOf', () => {
  it('maps homemade markup to the library component', () => {
    expect(
      lookAlikeOf(styled('app/x.tsx', 1, 'styled.button', 'Go'))
    ).toMatchObject({
      name: 'Go',
      target: 'Button',
    });
    expect(
      lookAlikeOf(
        styled('app/x.tsx', 1, "styled.input.attrs({ type: 'checkbox' })")
      )?.target
    ).toBe('Checkbox');
    expect(lookAlikeOf(styled('app/x.tsx', 1, 'styled.input'))?.target).toBe(
      'Input'
    );
    expect(
      lookAlikeOf(styled('app/x.tsx', 1, 'typedStyled(Link)'))?.note
    ).toMatch(/button/);
  });

  it('skips the library itself and plain blocks', () => {
    expect(
      lookAlikeOf(
        styled(
          'app/component-library/components/Button/index.tsx',
          1,
          'styled.button'
        )
      )
    ).toBeNull();
    expect(lookAlikeOf(styled('app/x.tsx', 1, 'styled.div'))).toBeNull();
  });
});

it('lists admin files first', () => {
  const list = lookAlikesFor(
    scan([
      styled('app/containers/Home/a.tsx', 3, 'styled.button'),
      styled('app/containers/Admin/b.tsx', 9, 'styled.button'),
      styled('app/containers/Admin/b.tsx', 2, 'styled.input'),
    ]),
    'Button'
  );
  expect(list.map((l) => `${l.finding.file}:${l.finding.line}`)).toEqual([
    'app/containers/Admin/b.tsx:9',
    'app/containers/Home/a.tsx:3',
  ]);
});

it('routesOfFile takes the closest page above the file', () => {
  const s = scan([], [
    { path: 'admin', office: 'admin', file: 'app/containers/Admin/index.tsx' },
    {
      path: 'admin/projects',
      office: 'admin',
      file: 'app/containers/Admin/projects/index.tsx',
    },
    { path: 'other', office: 'public', file: 'app/containers/Other/index.tsx' },
  ] as ScanOutput['routes']);
  expect(routesOfFile(s, 'app/containers/Admin/projects/edit/x.tsx')).toEqual([
    'admin/projects',
  ]);
  expect(routesOfFile(s, 'app/components/Y/index.tsx')).toEqual([]);
});

it('routesOfFile prefers the routes of the component that holds the file', () => {
  const s = scan(
    [],
    [],
    [{ file: 'app/components/admin/Card/index.tsx', routes: ['b', 'a', 'b'] }]
  );
  expect(routesOfFile(s, 'app/components/admin/Card/parts/Footer.tsx')).toEqual(
    ['a', 'b']
  );
});

it('formats the merge task', () => {
  const l = lookAlikeOf(styled('app/x.tsx', 4, 'styled.button', 'Go'))!;
  expect(
    formatMergeTask(
      l,
      'app/component-library/components/Button/index.tsx',
      'b--default',
      ['admin']
    )
  ).toBe(
    [
      'merge: Go · app/x.tsx:4 · styled.button → Button (app/component-library/components/Button/index.tsx)',
      'why: look-alike, homemade markup the library component covers',
      'check: story b--default, routes /admin',
    ].join('\n')
  );
});
