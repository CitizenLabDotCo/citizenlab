import { QuickSearchEntry } from './filterEntries';
import {
  addRecentKey,
  entryKey,
  getRecentEntries,
  matchEntry,
  readRecentKeys,
  writeRecentKeys,
} from './recents';

const recordId = '62d9c1d7-fbaf-4ff4-ba6e-aac24ef2b00a';

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

describe('matchEntry', () => {
  it('matches a sub-page to the closest entry', () => {
    expect(matchEntry('/admin/projects/1/phases/2/setup', entries)?.id).toBe(
      'phase-2'
    );
    expect(matchEntry('/admin/settings/branding/', entries)?.id).toBe(
      'settings-branding'
    );
  });

  it('does not match a page to a specific record beneath it', () => {
    expect(
      matchEntry(`/admin/projects/${recordId}/phases/1`, entries)
    ).toBeUndefined();
    expect(
      matchEntry(`/admin/settings/branding/emails/${recordId}/edit`, entries)
    ).toBeUndefined();
  });

  it('matches nothing for paths outside the entries', () => {
    expect(matchEntry('/admin/favicon', entries)).toBeUndefined();
  });
});

describe('addRecentKey', () => {
  it('puts the key first and removes its earlier visit', () => {
    expect(addRecentKey(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('keeps at most 20 keys', () => {
    const keys = Array.from({ length: 20 }, (_, i) => `key-${i}`);
    const result = addRecentKey(keys, 'new');

    expect(result).toHaveLength(20);
    expect(result[0]).toBe('new');
    expect(result).not.toContain('key-19');
  });
});

describe('getRecentEntries', () => {
  const keys = ['phases-phase-2', 'pages-settings-branding', 'pages-projects'];

  it('returns the entries in the order they were visited', () => {
    expect(ids(getRecentEntries(keys, entries, undefined))).toEqual([
      'phase-2',
      'settings-branding',
      'projects',
    ]);
  });

  it('leaves out the current page', () => {
    expect(ids(getRecentEntries(keys, entries, 'phases-phase-2'))).toEqual([
      'settings-branding',
      'projects',
    ]);
  });

  it('leaves out places that are no longer among the entries', () => {
    expect(
      ids(getRecentEntries(['phases-deleted', ...keys], entries, undefined))
    ).toEqual(['phase-2', 'settings-branding', 'projects']);
  });

  it('shows at most 10 entries', () => {
    const manyEntries: QuickSearchEntry[] = Array.from(
      { length: 12 },
      (_, i) => ({
        id: `page-${i}`,
        group: 'pages',
        breadcrumbs: [`Page ${i}`],
        link: { to: '/admin/settings/branding' },
      })
    );

    expect(
      getRecentEntries(manyEntries.map(entryKey), manyEntries, undefined)
    ).toHaveLength(10);
  });
});

describe('readRecentKeys', () => {
  afterEach(() => localStorage.clear());

  it('reads back what was written, per user', () => {
    writeRecentKeys('user-1', ['pages-projects']);

    expect(readRecentKeys('user-1')).toEqual(['pages-projects']);
    expect(readRecentKeys('user-2')).toEqual([]);
  });

  it('returns an empty list for corrupt data', () => {
    localStorage.setItem('admin-quick-search-recent:user-1', '{not json');
    expect(readRecentKeys('user-1')).toEqual([]);

    localStorage.setItem('admin-quick-search-recent:user-1', '{"a":1}');
    expect(readRecentKeys('user-1')).toEqual([]);
  });
});
