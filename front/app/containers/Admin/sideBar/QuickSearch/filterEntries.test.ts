import filterEntries, { QuickSearchEntry } from './filterEntries';

const entries: QuickSearchEntry[] = [
  {
    id: 'settings-branding',
    group: 'pages',
    breadcrumbs: ['Settings', 'Branding'],
    link: { to: '/admin/settings/branding' },
    keywords: 'settings/branding',
  },
  {
    id: 'project-1',
    group: 'projects',
    breadcrumbs: ['Projects', 'Réunion des quartiers'],
    link: { to: '/admin/projects/$projectId', params: { projectId: '1' } },
  },
  {
    id: 'phase-1',
    group: 'phases',
    breadcrumbs: ['Projects', 'Réunion des quartiers', 'Budget vote'],
    link: {
      to: '/admin/projects/$projectId/phases/$phaseId',
      params: { projectId: '1', phaseId: '2' },
    },
  },
];

const ids = (results: QuickSearchEntry[]) => results.map((entry) => entry.id);

describe('filterEntries', () => {
  it('returns nothing for an empty query', () => {
    expect(filterEntries(entries, '   ')).toEqual([]);
  });

  it('matches any part of the breadcrumbs case-insensitively', () => {
    expect(ids(filterEntries(entries, 'BRAND'))).toEqual(['settings-branding']);
  });

  it('matches paths through keywords', () => {
    expect(ids(filterEntries(entries, 'settings/bra'))).toEqual([
      'settings-branding',
    ]);
  });

  it('ignores accents', () => {
    expect(ids(filterEntries(entries, 'reunion'))).toEqual([
      'project-1',
      'phase-1',
    ]);
  });

  it('caps the number of results per group', () => {
    const manyPages: QuickSearchEntry[] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `page-${i}`,
        group: 'pages',
        breadcrumbs: [`Page ${i}`],
        link: { to: '/admin/settings/general' },
      })
    );
    const results = filterEntries([...manyPages, ...entries], 'e');

    expect(results.filter((entry) => entry.group === 'pages')).toHaveLength(15);
    expect(ids(results)).toContain('project-1');
  });

  it('puts entries whose own name matches before entries matched through a parent', () => {
    const riverside: QuickSearchEntry[] = [
      {
        id: 'phase-of-riverside',
        group: 'phases',
        breadcrumbs: ['Projects', 'Riverside', 'Survey'],
        link: { to: '/admin/projects' },
      },
      {
        id: 'riverside-phase',
        group: 'phases',
        breadcrumbs: ['Projects', 'Parks', 'Riverside walk'],
        link: { to: '/admin/projects' },
      },
    ];

    expect(ids(filterEntries(riverside, 'riverside'))).toEqual([
      'riverside-phase',
      'phase-of-riverside',
    ]);
  });

  it('keeps the closest matches when a group is capped', () => {
    const viaParent: QuickSearchEntry[] = Array.from(
      { length: 20 },
      (_, i) => ({
        id: `phase-${i}`,
        group: 'phases',
        breadcrumbs: ['Projects', 'Riverside', `Phase ${i}`],
        link: { to: '/admin/projects' },
      })
    );
    const byName: QuickSearchEntry = {
      id: 'riverside-walk',
      group: 'phases',
      breadcrumbs: ['Projects', 'Parks', 'Riverside walk'],
      link: { to: '/admin/projects' },
    };

    expect(ids(filterEntries([...viaParent, byName], 'riverside'))).toContain(
      'riverside-walk'
    );
  });

  it('requires every word to match, in any order', () => {
    expect(ids(filterEntries(entries, 'quartiers vote'))).toEqual(['phase-1']);
    expect(filterEntries(entries, 'branding vote')).toEqual([]);
  });
});
