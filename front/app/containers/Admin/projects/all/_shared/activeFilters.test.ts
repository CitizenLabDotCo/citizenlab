import { countActiveFilters } from './activeFilters';

describe('countActiveFilters', () => {
  it('is 0 without filters, for the default sort, or for only a search', () => {
    expect(countActiveFilters({}, undefined)).toBe(0);
    expect(
      countActiveFilters({ sort: 'recently_viewed', search: 'park' }, undefined)
    ).toBe(0);
  });

  it('counts the projects filters, a date range and a non-default sort', () => {
    expect(
      countActiveFilters(
        {
          status: ['published', 'draft'],
          managers: ['user-1'],
          review_state: 'pending',
          min_start_date: '2026-01-01',
          max_start_date: '2026-12-31',
          sort: 'alphabetically_asc',
          search: 'park',
        },
        undefined
      )
    ).toBe(5);
  });

  it('counts the same for the calendar as for the projects tab', () => {
    const params = {
      folder_ids: ['folder-1'],
      max_start_date: '2026-12-31',
      sort: 'alphabetically_desc' as const,
    };

    expect(countActiveFilters(params, 'calendar')).toBe(3);
    expect(countActiveFilters(params, undefined)).toBe(3);
  });

  it('ignores empty values', () => {
    expect(countActiveFilters({ status: [], search: '' }, undefined)).toBe(0);
  });

  it('only counts the folder filters on the folders tab', () => {
    expect(
      countActiveFilters(
        {
          status: ['published'],
          space_ids: ['space-1'],
          review_state: 'pending',
          sort: 'alphabetically_asc',
        },
        'folders'
      )
    ).toBe(2);
  });

  it('is 0 for tabs without filters', () => {
    expect(countActiveFilters({ status: ['published'] }, 'ordering')).toBe(0);
    expect(countActiveFilters({ search: 'park' }, 'spaces')).toBe(0);
  });
});
