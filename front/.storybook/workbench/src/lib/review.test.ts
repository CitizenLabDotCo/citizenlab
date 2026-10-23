import type { ScanOutput, TokenMeta } from './data';
import {
  affectedRoutes,
  applyEdits,
  DesignChanges,
  frameState,
  groupCommits,
  normaliseFixture,
  parseReviewHash,
  prMarkdown,
  resolveRoute,
  reviewHash,
  reviewSummary,
  RouteFixture,
  routesFor,
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

const meta: TokenMeta[] = [
  {
    name: '--gv-radius-2',
    category: 'radius',
    tier: 1,
    values: { today: '4px', redesign: '4px' },
    legacy: [],
  },
  {
    name: '--gv-radius-control',
    category: 'radius',
    tier: 2,
    values: { today: 'var(--gv-radius-2)', redesign: 'var(--gv-radius-2)' },
    legacy: ['theme.borderRadius'],
  },
];

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

describe('routesFor', () => {
  it('lists each path once with its office', () => {
    const paths = routesFor(scan(), {}).map((r) => r.path);
    expect(paths).toEqual([
      '',
      'admin/projects',
      'admin/projects/$projectId',
      'ideas/$slug',
    ]);
  });

  it('keeps only touched routes with onlyAffected', () => {
    const touched = routesFor(scan(), {
      onlyAffected: true,
      changes: changes([['front/app/shared.tsx']]),
    }).map((r) => r.path);
    expect(touched).toEqual(['', 'ideas/$slug']);
  });

  it('counts routes that read an overridden token as affected', () => {
    const s = scan({
      findings: [
        {
          file: 'app/radius.tsx',
          line: 1,
          col: 1,
          raw: 'theme.borderRadius',
          category: 'legacy-theme',
          confidence: 'high',
        },
      ],
    });
    // The primitive reaches the tier-2 token that reads it.
    const touched = routesFor(s, {
      onlyAffected: true,
      overrides: { '--gv-radius-2': '8px' },
      meta,
    }).map((r) => r.path);
    expect(touched).toEqual(['admin/projects/$projectId']);
  });

  it('keeps nothing with onlyAffected and no changes', () => {
    expect(routesFor(scan(), { onlyAffected: true })).toEqual([]);
  });

  it('filters by component, office and search', () => {
    expect(
      routesFor(scan(), { component: 'Button' }).map((r) => r.path)
    ).toEqual(['admin/projects', 'ideas/$slug']);
    expect(
      routesFor(scan(), { component: 'Button', office: 'admin' }).map(
        (r) => r.path
      )
    ).toEqual(['admin/projects']);
    expect(
      routesFor(scan(), { search: 'PROJECTS/$' }).map((r) => r.path)
    ).toEqual(['admin/projects/$projectId']);
  });

  it('finds the routes of one commit', () => {
    expect(
      routesFor(scan(), {
        commit: 'sha0',
        changes: changes([['front/app/admin/p.tsx']]),
      }).map((r) => r.path)
    ).toEqual(['admin/projects/$projectId']);
  });
});

describe('affectedRoutes', () => {
  it('maps changed files without the front/ prefix', () => {
    expect([
      ...affectedRoutes(scan(), changes([['front/app/admin/b.tsx']]), {}, []),
    ]).toEqual(['admin/projects']);
  });
});

const doc = (url: string, html = ''): Document => {
  const d = document.implementation.createHTMLDocument('x');
  d.body.innerHTML = html;
  Object.defineProperty(d, 'URL', { value: url });
  return d;
};

describe('frameState', () => {
  it('is blank without a document or before navigation', () => {
    expect(frameState(null)).toBe('blank');
    expect(frameState(doc('about:blank'))).toBe('blank');
  });

  it('is login on the sign-in page', () => {
    expect(frameState(doc('https://h/en/sign-in/admin'))).toBe('login');
  });

  it('is login when the body has a sign-in form', () => {
    expect(
      frameState(doc('https://h/en/x', '<form action="/users/sign_in"></form>'))
    ).toBe('login');
  });

  it('is login when an admin route redirected away from the admin', () => {
    expect(frameState(doc('https://h/en'), 'admin/projects')).toBe('login');
    expect(
      frameState(doc('https://h/en/admin/projects'), 'admin/projects')
    ).toBe('ok');
  });

  it('is cross-origin when access throws', () => {
    const throwing = {
      get URL(): string {
        throw new Error('SecurityError');
      },
    } as unknown as Document;
    expect(frameState(throwing)).toBe('cross-origin');
    expect(
      frameState(() => {
        throw new Error('SecurityError');
      })
    ).toBe('cross-origin');
  });

  it('is ok on a page', () => {
    expect(frameState(doc('https://h/en/projects/a', '<main></main>'))).toBe(
      'ok'
    );
  });
});

describe('applyEdits', () => {
  it('keeps the page own inline tokens and restores them on reset', () => {
    const d = doc('https://h/en/');
    d.documentElement.style.setProperty('--gv-tenant-primary', 'red');
    const applied = new Map<string, string | null>();
    applyEdits(d, { '--gv-radius-2': '8px' }, 'redesign', applied);
    expect(d.documentElement.style.getPropertyValue('--gv-radius-2')).toBe(
      '8px'
    );
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('red');
    expect(d.documentElement.getAttribute('data-gv-mode')).toBe('redesign');

    applyEdits(d, { '--gv-tenant-primary': 'blue' } as never, 'today', applied);
    expect(d.documentElement.style.getPropertyValue('--gv-radius-2')).toBe('');
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('blue');
    expect(d.documentElement.hasAttribute('data-gv-mode')).toBe(false);

    applyEdits(d, {}, 'today', applied);
    expect(
      d.documentElement.style.getPropertyValue('--gv-tenant-primary')
    ).toBe('red');
  });
});

describe('groupCommits', () => {
  it('groups by component, then kind, components A to Z and none last', () => {
    const c = changes([['a'], ['b'], ['c']]);
    c.commits[1].component = undefined;
    c.commits[1].kind = 'other';
    c.commits[2].component = 'Accordion';
    c.commits[2].kind = 'story';
    const groups = groupCommits(c.commits);
    expect(groups.map((g) => g.component)).toEqual([
      'Accordion',
      'Button',
      null,
    ]);
    expect(groups[1].kinds.map((k) => [k.kind, k.commits.length])).toEqual([
      ['heal', 1],
    ]);
  });
});

describe('review hash', () => {
  it('reads and writes the review state, keeping the overrides', () => {
    const state = parseReviewHash(
      '#/review?route=admin%2Fprojects&component=Button&o=abc&only=1&office=admin'
    );
    expect(state).toEqual({
      route: 'admin/projects',
      component: 'Button',
      office: 'admin',
      only: true,
      tab: 'routes',
    });
    expect(
      reviewHash('#/review?o=abc&route=x', { ...state, route: 'ideas/$slug' })
    ).toBe(
      '#/review?o=abc&route=ideas%2F%24slug&component=Button&office=admin&only=1'
    );
    expect(parseReviewHash('#/review').office).toBe('all');
  });
});

describe('summary and PR text', () => {
  it('counts changes, components, routes and the off-spec delta', () => {
    const c = changes([['front/app/shared.tsx'], ['front/app/admin/a.tsx']]);
    c.commits[0].scanDelta = { offSpec: -5 };
    c.commits[1].component = 'Input';
    const summary = reviewSummary(scan({ totals: { offSpec: 100 } as never }), {
      changes: c,
      overrides: { '--gv-radius-2': '8px' },
      meta,
    });
    expect(summary).toMatchObject({
      commits: 2,
      tokenEdits: 1,
      components: ['Button', 'Input'],
      offSpecBefore: 105,
      offSpecAfter: 100,
    });
    expect(summary.routes).toEqual(['', 'admin/projects', 'ideas/$slug']);

    const md = prMarkdown(
      summary,
      'https://h/storybook/workbench/#/review?o=x'
    );
    expect(md).toContain(
      '3 design changes across 2 components and 3 routes, reviewed in the workbench'
    );
    expect(md).toContain('Off-spec values: 105 before, 100 after (-5)');
    expect(md).toContain('`--gv-radius-2`: 8px');
    expect(md).toContain(
      '[Open the review](https://h/storybook/workbench/#/review?o=x)'
    );
    expect(md).not.toContain('\u2014');
  });
});
