import { QuickSearchEntry } from './filterEntries';
import {
  addRecentPath,
  getRecentEntries,
  readRecentPaths,
  writeRecentPaths,
} from './recentPaths';

const entries: QuickSearchEntry[] = [
  {
    id: 'projects',
    group: 'pages',
    breadcrumbs: ['Projects'],
    link: { to: '/admin/projects' },
  },
  {
    id: 'settings-branding',
    group: 'pages',
    breadcrumbs: ['Settings', 'Branding'],
    link: { to: '/admin/settings/branding' },
  },
  {
    id: 'project-1',
    group: 'projects',
    breadcrumbs: ['Projects', 'Project 1'],
    link: { to: '/admin/projects/$projectId', params: { projectId: '1' } },
  },
  {
    id: 'phase-2',
    group: 'phases',
    breadcrumbs: ['Projects', 'Project 1', 'Phase 2'],
    link: {
      to: '/admin/projects/$projectId/phases/$phaseId',
      params: { projectId: '1', phaseId: '2' },
    },
  },
];

const ids = (results: QuickSearchEntry[]) => results.map((entry) => entry.id);

describe('addRecentPath', () => {
  it('puts the path first and removes its earlier visit', () => {
    expect(addRecentPath(['/a', '/b', '/c'], '/b')).toEqual(['/b', '/a', '/c']);
  });

  it('keeps at most 30 paths', () => {
    const paths = Array.from({ length: 30 }, (_, i) => `/path-${i}`);
    const result = addRecentPath(paths, '/new');

    expect(result).toHaveLength(30);
    expect(result[0]).toBe('/new');
    expect(result).not.toContain('/path-29');
  });
});

describe('getRecentEntries', () => {
  it('matches sub-pages to the closest entry', () => {
    expect(
      ids(
        getRecentEntries(
          ['/admin/projects/1/phases/2/setup', '/admin/settings/branding/'],
          entries,
          '/admin/dashboard'
        )
      )
    ).toEqual(['phase-2', 'settings-branding']);
  });

  it('shows each entry once, at its newest visit', () => {
    expect(
      ids(
        getRecentEntries(
          [
            '/admin/projects/1/phases/2/ideas',
            '/admin/settings/branding',
            '/admin/projects/1/phases/2/setup',
          ],
          entries,
          '/admin/dashboard'
        )
      )
    ).toEqual(['phase-2', 'settings-branding']);
  });

  it('leaves out the current page', () => {
    expect(
      ids(
        getRecentEntries(
          ['/admin/projects/1/phases/2/ideas', '/admin/settings/branding'],
          entries,
          '/admin/projects/1/phases/2/setup'
        )
      )
    ).toEqual(['settings-branding']);
  });

  it('does not match a page to a specific record beneath it', () => {
    const recordId = '62d9c1d7-fbaf-4ff4-ba6e-aac24ef2b00a';

    expect(
      getRecentEntries(
        [
          `/admin/projects/${recordId}/phases/1`,
          `/admin/settings/branding/emails/${recordId}/edit`,
        ],
        entries,
        '/admin/dashboard'
      )
    ).toEqual([]);
  });

  it('leaves out paths without a matching entry', () => {
    expect(
      getRecentEntries(['/admin', '/admin/favicon'], entries, '/admin/projects')
    ).toEqual([]);
  });

  it('shows at most 10 entries', () => {
    const manyEntries: QuickSearchEntry[] = Array.from(
      { length: 12 },
      (_, i) => ({
        id: `page-${i}`,
        group: 'pages',
        breadcrumbs: [`Page ${i}`],
        link: {
          to: '/admin/projects/$projectId',
          params: { projectId: `${i}` },
        },
      })
    );
    const paths = manyEntries.map((_, i) => `/admin/projects/${i}`);

    expect(getRecentEntries(paths, manyEntries, '/admin')).toHaveLength(10);
  });
});

describe('readRecentPaths', () => {
  afterEach(() => localStorage.clear());

  it('reads back what was written, per user', () => {
    writeRecentPaths('user-1', ['/admin/projects']);

    expect(readRecentPaths('user-1')).toEqual(['/admin/projects']);
    expect(readRecentPaths('user-2')).toEqual([]);
  });

  it('returns an empty list for corrupt data', () => {
    localStorage.setItem('admin-quick-search-recent:user-1', '{not json');
    expect(readRecentPaths('user-1')).toEqual([]);

    localStorage.setItem('admin-quick-search-recent:user-1', '{"a":1}');
    expect(readRecentPaths('user-1')).toEqual([]);
  });
});
