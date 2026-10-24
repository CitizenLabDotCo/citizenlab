import type { ScanOutput, TokenMeta } from './data';
import {
  adoptPageTokens,
  affectedRoutes,
  applyEdits,
  changeReach,
  dismissConsent,
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

const meta: TokenMeta[] = [
  {
    name: '--gv-radius-2',
    category: 'radius',
    tier: 1,
    value: '4px',
    legacy: [],
  },
  {
    name: '--gv-radius-control',
    category: 'radius',
    tier: 2,
    value: 'var(--gv-radius-2)',
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

// Twelve routes, each with its own page file; App.tsx is in all of them and
// almost.tsx in 11 of 12 (over the 90% shell share), rare.tsx in 2.
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

  it('do not mark routes as affected, and are reported', () => {
    const c = changes([
      ['front/app/App.tsx'],
      ['front/app/rare.tsx', 'front/app/almost.tsx'],
    ]);
    expect([...affectedRoutes(bigScan(), c, {}, [])].sort()).toEqual([
      'admin/p0',
      'admin/p1',
    ]);
    const reach = changeReach(bigScan(), c, {}, []);
    expect(reach.shellFiles).toEqual(['app/App.tsx', 'app/almost.tsx']);
    expect(reach.shellCommits).toEqual(['sha0', 'sha1']);
  });

  it('are left out of the routes of one commit', () => {
    expect(
      routesFor(bigScan(), {
        commit: 'sha0',
        changes: changes([['front/app/App.tsx']]),
      })
    ).toEqual([]);
  });
});

describe('dismissConsent', () => {
  it('declines the cookie modal once it shows', () => {
    const d = document.implementation.createHTMLDocument('x');
    expect(dismissConsent(d)).toBe(false);
    d.body.innerHTML =
      '<button data-testid="accept-cookies-btn"></button><button data-testid="reject-cookies-btn"></button>';
    const clicked: string[] = [];
    d.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () =>
        clicked.push(b.getAttribute('data-testid') ?? '')
      )
    );
    expect(dismissConsent(d)).toBe(true);
    expect(clicked).toEqual(['reject-cookies-btn']);
  });
});

describe('design commits only', () => {
  it('a tags-like tooling commit touching many library files marks no route', () => {
    const c = changes([
      Array.from({ length: 12 }, (_, i) => `front/app/p${i}.tsx`),
      ['front/app/admin/a.stories.tsx', 'front/app/p4.tsx'],
      ['front/app/p3.tsx'],
    ]);
    c.commits[0].kind = 'other';
    c.commits[0].component = undefined;
    c.commits[1].kind = 'story';
    c.commits[2].kind = 'lift';
    const reach = changeReach(bigScan(), c, {}, []);
    expect([...reach.routes]).toEqual(['admin/p3']);
    expect(reach.shellFiles).toEqual([]);
    expect(
      routesFor(bigScan(), { commit: 'sha0', changes: c }).map((r) => r.path)
    ).toEqual([]);
  });

  it('a token override still marks the routes that read it', () => {
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
    const c = changes([['front/app/shared.tsx']]);
    c.commits[0].kind = 'other';
    expect([...affectedRoutes(s, c, { '--gv-radius-2': '8px' }, meta)]).toEqual(
      ['admin/projects/$projectId']
    );
  });
});

describe('prMarkdown headline', () => {
  it('names shell files when no route is reached', () => {
    const md = prMarkdown(
      {
        ...reviewSummary(bigScan(), { overrides: {}, meta: [] }),
        designCommits: 3,
        components: [],
        routes: [],
        shellFiles: ['app/component-library/utils/styleUtils.ts'],
      },
      'L'
    );
    expect(md).toContain(
      '**3 design changes to shell files on every page, reviewed in the workbench.**'
    );
  });
});

describe('summary and PR text', () => {
  const mixed = () => {
    const c = changes([
      ['front/app/shared.tsx'],
      ['front/app/admin/a.tsx'],
      ['front/app/admin/a.stories.tsx'],
      ['front/scripts/design-system/scan/findings.ts'],
      ['front/.storybook/workbench/src/App.tsx'],
    ]);
    c.commits[0].scanDelta = { offSpec: -5 };
    c.commits[1].component = 'Input';
    c.commits[1].kind = 'lift';
    c.commits[2].component = 'Arabic';
    c.commits[2].kind = 'story';
    c.commits[3].kind = 'other';
    c.commits[3].component = undefined;
    c.commits[3].scanDelta = { offSpec: 1743 };
    c.commits[4].kind = 'other';
    c.commits[4].component = undefined;
    c.commits[4].scanDelta = { offSpec: 2 };
    return c;
  };

  it('counts design changes apart from stories, tooling and scanner rules', () => {
    const summary = reviewSummary(scan({ totals: { offSpec: 100 } as never }), {
      changes: mixed(),
      overrides: { '--gv-radius-2': '8px' },
      meta,
    });
    expect(summary).toMatchObject({
      commits: 5,
      designCommits: 2,
      stories: 1,
      tooling: 2,
      tokenEdits: 1,
      components: ['Button', 'Input'],
      offSpecBefore: 105,
      offSpecAfter: 100,
      scannerDelta: 1743,
      otherDelta: 2,
    });
    // Design commits (shared.tsx, admin/a.tsx) and the token edit only.
    expect(summary.routes).toEqual(['', 'admin/projects', 'ideas/$slug']);

    const md = prMarkdown(
      summary,
      'https://h/storybook/workbench/#/review?o=x'
    );
    expect(md).toContain(
      '3 design changes across 2 components and 3 routes, reviewed in the workbench'
    );
    expect(md).toContain('- Design commits: 2 (1 heal, 1 lift)');
    expect(md).toContain(
      '- Not counted as design changes: 1 story commit, 2 tooling commits'
    );
    expect(md).toContain(
      'Off-spec values: 105 before the design commits, 100 now (-5)'
    );
    expect(md).toContain(
      'Scanner rule changes moved the count by +1743 and are not in this delta'
    );
    expect(md).toContain('Other commits moved it by +2');
    expect(md).toContain('`/ideas/:slug`');
    expect(md).not.toContain('$slug');
    expect(md).toContain('`--gv-radius-2`: 8px');
    expect(md).toContain(
      '[Open the review](https://h/storybook/workbench/#/review?o=x)'
    );
    expect(md).not.toContain('\u2014');
  });

  it('names shell files as affecting every page', () => {
    const summary = reviewSummary(bigScan(), {
      changes: changes([['front/app/App.tsx'], ['front/app/p3.tsx']]),
      overrides: {},
      meta,
    });
    expect(summary.routes).toEqual(['admin/p3']);
    expect(summary.shellFiles).toEqual(['app/App.tsx']);
    const md = prMarkdown(summary, 'l');
    expect(md).toContain(
      '2 design changes across 1 component and 1 route (plus shell files on every page)'
    );
    expect(md).toContain(
      '- Shell files changed, they affect every page: `app/App.tsx`'
    );
  });
});
