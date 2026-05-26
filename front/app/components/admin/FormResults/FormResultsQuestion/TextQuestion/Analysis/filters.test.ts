import { getPublishedAtFromFilter, getPublishedAtToFilter } from './utils';

describe('getPublishedAtFromFilter', () => {
  it('returns the first day of Q1 when both params are provided', () => {
    expect(getPublishedAtFromFilter('2025', '1')).toBe('2025-01-01');
  });

  it('returns the first day of Q3 when both params are provided', () => {
    expect(getPublishedAtFromFilter('2024', '3')).toBe('2024-07-01');
  });

  it('returns undefined when yearParam is undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter(undefined, '1')).toBeUndefined();
  });

  it('returns undefined when quarterParam is undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter('2025', undefined)).toBeUndefined();
  });

  it('returns undefined when both params are undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter(undefined, undefined)).toBeUndefined();
  });
});

describe('getPublishedAtToFilter', () => {
  it('returns the last day of Q1 when both params are provided', () => {
    expect(getPublishedAtToFilter('2025', '1')).toBe('2025-03-31');
  });

  it('returns the last day of Q4 when both params are provided', () => {
    expect(getPublishedAtToFilter('2023', '4')).toBe('2023-12-31');
  });

  it('returns undefined when yearParam is undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter(undefined, '1')).toBeUndefined();
  });

  it('returns undefined when quarterParam is undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter('2025', undefined)).toBeUndefined();
  });

  it('returns undefined when both params are undefined (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter(undefined, undefined)).toBeUndefined();
  });
});
