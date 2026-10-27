import type { ScanOutput } from './data';
import {
  adoptPageTokens,
  applyEdits,
  commitReach,
  DesignChanges,
  normaliseFixture,
  resolveRoute,
  RouteFixture,
  shellFiles,
  unfilledParams,
} from './review';

const fixture: RouteFixture = {
  hosts: { after: '', before: 'https://baseline.example' },
  params: { projectId: 'p-1', phaseId: 'ph 2', slug: 'a-project' },
  paths: { 'ideas/$slug': { slug: 'an-idea' } },
  locale: 'en',
  missing: ['analysisId'],
};

const scan = (over: Partial<ScanOutput> = {}): ScanOutput => ({
  generatedAt: '',
  commit: '',
  findings: [],
  usages: [],
  routes: [
    { path: '', office: 'public', file: 'app/containers/HomePage/index.tsx' },
    { path: 'admin/projects', office: 'admin', file: 'app/admin/a.tsx' },
    // A second page file for the same path.
    { path: 'admin/projects', office: 'admin', file: 'app/admin/b.tsx' },
    {
      path: 'admin/projects/$projectId',
      office: 'admin',
      file: 'app/admin/p.tsx',
    },
    { path: 'ideas/$slug', office: 'public', file: 'app/ideas/i.tsx' },
  ],
  components: [
    {
      component: 'Button',
      file: 'app/component-library/components/Button/index.tsx',
      score: 0,
      counts: {} as never,
      usageCount: 3,
      routes: ['admin/projects', 'ideas/$slug'],
      status: 'partly',
    },
  ],
  pages: [],
  totals: {} as never,
  routeFiles: {
    '': ['app/containers/HomePage/index.tsx', 'app/shared.tsx'],
    'admin/projects': ['app/admin/a.tsx', 'app/admin/b.tsx'],
    'admin/projects/$projectId': ['app/admin/p.tsx', 'app/radius.tsx'],
    'ideas/$slug': ['app/ideas/i.tsx', 'app/shared.tsx'],
  },
  ...over,
});

const changes = (files: string[][]): DesignChanges => ({
  generatedAt: '',
  base: 'b',
  baseRef: 'master',
  head: 'h',
  repoUrl: 'https://github.com/org/repo',
  commits: files.map((f, i) => ({
    sha: `sha${i}`,
    subject: `design-system(heal): Button ${i} [AI-assisted]`,
    body: '',
    files: f,
    kind: 'heal',
    component: 'Button',
  })),
  tokenChanges: [],
  warnings: [],
});

describe('resolveRoute', () => {
  it('fills $params from the fixture and prefixes the locale', () => {
    expect(
      resolveRoute('admin/projects/$projectId', fixture, 'https://host')
    ).toBe('https://host/en/admin/projects/p-1');
  });

  it('reads the route override in paths before params', () => {
    expect(resolveRoute('ideas/$slug', fixture, 'https://host/')).toBe(
      'https://host/en/ideas/an-idea'
    );
    expect(resolveRoute('projects/$slug', fixture, 'https://host')).toBe(
      'https://host/en/projects/a-project'
    );
  });

  it('encodes values and resolves the home route', () => {
    expect(
      resolveRoute('admin/projects/$projectId/phases/$phaseId', fixture, 'h')
    ).toBe('h/en/admin/projects/p-1/phases/ph%202');
    expect(resolveRoute('', fixture, 'https://host')).toBe('https://host/en/');
  });

  it('returns no URL when a param has no record', () => {
    expect(
      resolveRoute(
        'admin/projects/$projectId/analysis/$analysisId',
        fixture,
        'h'
      )
    ).toBe('');
    expect(
      unfilledParams('admin/projects/$projectId/analysis/$analysisId', fixture)
    ).toEqual(['analysisId']);
    expect(unfilledParams('admin/projects/$projectId', fixture)).toEqual([]);
  });
});

describe('normaliseFixture', () => {
  it('tolerates a missing or damaged file', () => {
    const f = normaliseFixture({ params: { a: 1, b: 'x' }, paths: 'no' });
    expect(f.params).toEqual({ b: 'x' });
    expect(f.paths).toEqual({});
    expect(f.locale).toBe('en');
    expect(f.hosts).toEqual({ after: '', before: '' });
    expect(normaliseFixture(null).params).toEqual({});
  });
});

const doc = (url: string, html = ''): Document => {
  const d = document.implementation.createHTMLDocument('x');
  d.body.innerHTML = html;
  Object.defineProperty(d, 'URL', { value: url });
  return d;
};

describe('applyEdits', () => {
  it('keeps the page own inline tokens and restores them on reset', () => {
    const d = doc('https://h/en/');
    d.documentElement.style.setProperty('--gv-tenant-primary', 'red');
    const applied = new Map<string, string | null>();
    applyEdits(d, { '--gv-radius-2': '8px' }, applied);
    expect(d.documentElement.style.getPropertyValue('--gv-radius-2')).toBe(
      '8px'
    );
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('red');

    applyEdits(d, { '--gv-tenant-primary': 'blue' } as never, applied);
    expect(d.documentElement.style.getPropertyValue('--gv-radius-2')).toBe('');
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('blue');

    applyEdits(d, {}, applied);
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('red');
  });
});

describe('adoptPageTokens', () => {
  it('takes the value the page wrote over an edit as the one to restore', () => {
    const d = doc('https://h/en/');
    const style = d.documentElement.style;
    style.setProperty('--gv-tenant-primary', 'red');
    const applied = new Map<string, string | null>();
    const edits = { '--gv-tenant-primary': 'blue', '--gv-radius-2': '8px' };
    applyEdits(d, edits as never, applied);
    // The story mounts again in another city: its theme context writes the
    // tenant colour over the edit; the radius edit stays.
    style.setProperty('--gv-tenant-primary', 'green');
    adoptPageTokens(d, edits as never, applied);
    applyEdits(d, edits as never, applied);
    expect(style.getPropertyValue('--gv-tenant-primary')).toBe('blue');

    applyEdits(d, {}, applied);
    expect(style.getPropertyValue('--gv-tenant-primary')).toBe('green');
    expect(style.getPropertyValue('--gv-radius-2')).toBe('');
  });

  it('knows its own edit as the browser reads it back', () => {
    const d = doc('https://h/en/');
    const style = d.documentElement.style;
    const applied = new Map<string, string | null>();
    // A browser trims the value it stores; jsdom may not, so here it does.
    const proto = CSSStyleDeclaration.prototype;
    const set = proto.setProperty;
    const spy = jest
      .spyOn(proto, 'setProperty')
      .mockImplementation(function (
        this: CSSStyleDeclaration,
        n: string,
        v: string | null,
        p?: string
      ) {
        set.call(this, n, typeof v === 'string' ? v.trim() : v, p);
      });
    try {
      const edits = { '--gv-radius-2': ' 8px ' };
      applyEdits(d, edits as never, applied);
      expect(style.getPropertyValue('--gv-radius-2')).toBe('8px');
      adoptPageTokens(d, edits as never, applied);
      applyEdits(d, {}, applied);
      expect(style.getPropertyValue('--gv-radius-2')).toBe('');
    } finally {
      spy.mockRestore();
    }
  });

  it('keeps the original while the edits hold', () => {
    const d = doc('https://h/en/');
    const style = d.documentElement.style;
    style.setProperty('--gv-tenant-primary', 'red');
    const applied = new Map<string, string | null>();
    const edits = { '--gv-tenant-primary': 'blue' };
    applyEdits(d, edits as never, applied);
    adoptPageTokens(d, edits as never, applied);
    applyEdits(d, {}, applied);
    expect(style.getPropertyValue('--gv-tenant-primary')).toBe('red');
  });
});

const bigScan = (): ScanOutput => {
  const paths = Array.from({ length: 12 }, (_, i) => `admin/p${i}`);
  return scan({
    routes: paths.map((p, i) => ({
      path: p,
      office: 'admin' as const,
      file: `app/p${i}.tsx`,
    })),
    routeFiles: Object.fromEntries(
      paths.map((p, i) => [
        p,
        [
          `app/p${i}.tsx`,
          'app/App.tsx',
          ...(i < 11 ? ['app/almost.tsx'] : []),
          ...(i < 2 ? ['app/rare.tsx'] : []),
        ],
      ])
    ),
  });
};

describe('shell files', () => {
  it('are files in at least 90% of route closures, on a large enough scan', () => {
    expect([...shellFiles(bigScan())].sort()).toEqual([
      'app/App.tsx',
      'app/almost.tsx',
    ]);
    // Four routes are too few to tell the shell apart.
    expect(shellFiles(scan()).size).toBe(0);
  });
});

describe('commitReach', () => {
  it('reaches the routes of the files a design commit changes, the shell left out', () => {
    const c = changes([['front/app/rare.tsx', 'front/app/almost.tsx']]);
    expect(commitReach(bigScan(), c.commits[0])).toEqual({
      routes: new Set(['admin/p0', 'admin/p1']),
      shell: true,
    });
  });

  it('reaches nothing for a commit that is not a design change', () => {
    const c = changes([['front/app/p3.tsx']]);
    c.commits[0].kind = 'story';
    expect(commitReach(bigScan(), c.commits[0]).routes.size).toBe(0);
  });
});
