import {
  fileFindings,
  githubLink,
  propCounts,
  reviewLink,
  routesByOffice,
  usageFiles,
} from './componentPanels';
import type { Finding, ScanOutput } from './data';

const FILE = 'app/component-library/components/Button/index.tsx';

const f = (partial: Partial<Finding>): Finding => ({
  file: FILE,
  line: 1,
  col: 1,
  raw: '',
  category: 'px',
  confidence: 'high',
  ...partial,
});

const scan = (partial: Partial<ScanOutput>): ScanOutput =>
  ({
    findings: [],
    usages: [],
    routes: [],
    components: [],
    pages: [],
    ...partial,
  } as ScanOutput);

describe('usage', () => {
  const s = scan({
    usages: [
      { component: 'Button', file: 'app/a.tsx', line: 9, props: ['onClick'] },
      {
        component: 'Button',
        file: 'app/a.tsx',
        line: 4,
        props: ['onClick', 'icon'],
      },
      { component: 'Button', file: 'app/b.tsx', line: 2, props: [] },
      {
        component: 'Button',
        file: 'app/component-library/index.tsx',
        line: 1,
        props: ['onClick'],
      },
      { component: 'Button', file: FILE, line: 5, props: ['icon'] },
      { component: 'Box', file: 'app/a.tsx', line: 1, props: ['p'] },
    ],
    routes: [
      { path: 'admin', office: 'admin', file: 'x' },
      { path: '', office: 'public', file: 'y' },
    ],
    findings: [
      f({ line: 9 }),
      f({ line: 2, category: 'token-var' }),
      f({ line: 1, file: 'app/other.tsx' }),
      f({ line: 3, category: 'hex' }),
    ],
  });

  it('counts uses per file, without the barrel, most first', () => {
    expect(usageFiles(s, 'Button', FILE)).toEqual([
      { file: 'app/a.tsx', count: 2, line: 4, props: ['onClick', 'icon'] },
      { file: 'app/b.tsx', count: 1, line: 2, props: [] },
    ]);
    // Same uses as the file list: no barrel, no own file.
    expect(propCounts(s, 'Button', FILE)).toEqual([
      ['onClick', 2],
      ['icon', 1],
    ]);
  });

  it('splits routes by office', () => {
    expect(routesByOffice(s, ['admin', '', 'admin/x', 'admin'])).toEqual({
      admin: ['admin', 'admin/x'],
      public: [''],
    });
  });

  it('lists the file findings in order, without token reads', () => {
    expect(fileFindings(s, FILE).map((x) => [x.line, x.category])).toEqual([
      [3, 'hex'],
      [9, 'px'],
    ]);
    expect(fileFindings(s, undefined)).toEqual([]);
  });

  it('links to the branch on GitHub and to the Review page', () => {
    expect(githubLink('app/a.tsx', 4)).toBe(
      'https://github.com/CitizenLabDotCo/citizenlab/blob/design-system/workbench/front/app/a.tsx#L4'
    );
    expect(reviewLink('admin/projects/$projectId', 'Button')).toBe(
      '#/review?route=admin%2Fprojects%2F%24projectId&component=Button'
    );
  });
});
