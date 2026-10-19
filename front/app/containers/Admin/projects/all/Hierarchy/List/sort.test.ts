import { getNextSort, getSortDirection } from './sort';

describe('getNextSort', () => {
  it('orders a text column ascending, then descending, then not at all', () => {
    expect(getNextSort('project', undefined)).toBe('alphabetically_asc');
    expect(getNextSort('project', 'alphabetically_asc')).toBe(
      'alphabetically_desc'
    );
    expect(getNextSort('project', 'alphabetically_desc')).toBeUndefined();
  });

  it('starts numbers and dates with the biggest or latest', () => {
    expect(getNextSort('participants', undefined)).toBe('participation_desc');
    expect(getNextSort('end_date', 'end_date_desc')).toBe('end_date_asc');
  });

  it('starts over when another column is clicked', () => {
    expect(getNextSort('status', 'phase_desc')).toBe('status_asc');
  });

  it('leaves the order alone for a column that cannot sort', () => {
    expect(getNextSort('access', 'phase_asc')).toBe('phase_asc');
  });
});

describe('getSortDirection', () => {
  it('says which way the list is ordered by this column', () => {
    expect(getSortDirection('phase', 'phase_desc')).toBe('desc');
    expect(getSortDirection('phase', 'status_desc')).toBeUndefined();
    expect(getSortDirection('phase', 'arranged')).toBeUndefined();
  });
});
