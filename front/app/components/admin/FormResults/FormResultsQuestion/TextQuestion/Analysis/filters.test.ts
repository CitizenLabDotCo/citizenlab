import { getPublishedAtFromFilter, getPublishedAtToFilter } from './utils';

describe('getPublishedAtFromFilter', () => {
  it('returns correct start date for Q1', () => {
    expect(getPublishedAtFromFilter('2025', '1')).toBe('2025-01-01');
  });

  it('returns correct start date for Q3', () => {
    expect(getPublishedAtFromFilter('2024', '3')).toBe('2024-07-01');
  });

  it('returns undefined when year is missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter(undefined, '1')).toBeUndefined();
  });

  it('returns undefined when quarter is missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter('2025', undefined)).toBeUndefined();
  });

  it('returns undefined when both year and quarter are missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtFromFilter(undefined, undefined)).toBeUndefined();
  });
});

describe('getPublishedAtToFilter', () => {
  it('returns correct end date for Q1', () => {
    expect(getPublishedAtToFilter('2025', '1')).toBe('2025-03-31');
  });

  it('returns correct end date for Q4', () => {
    expect(getPublishedAtToFilter('2023', '4')).toBe('2023-12-31');
  });

  it('returns undefined when year is missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter(undefined, '1')).toBeUndefined();
  });

  it('returns undefined when quarter is missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter('2025', undefined)).toBeUndefined();
  });

  it('returns undefined when both year and quarter are missing (non-Community-Monitor flow)', () => {
    expect(getPublishedAtToFilter(undefined, undefined)).toBeUndefined();
  });
});
