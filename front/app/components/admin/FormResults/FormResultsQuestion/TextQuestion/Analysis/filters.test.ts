import {
  getPublishedAtFromFilter,
  getPublishedAtToFilter,
  isOtherFiltered,
} from './utils';

const FIELD_ID = 'abc-123';
const KEY = `input_custom_${FIELD_ID}` as const;

describe('isOtherFiltered', () => {
  it('is true when the question filter is an array containing "other"', () => {
    expect(isOtherFiltered({ [KEY]: ['other'] }, FIELD_ID)).toBe(true);
  });

  it('is true when "other" is one of several selected values', () => {
    expect(isOtherFiltered({ [KEY]: ['red', 'other'] }, FIELD_ID)).toBe(true);
  });

  it('is true when the question filter is the string "other"', () => {
    expect(isOtherFiltered({ [KEY]: 'other' }, FIELD_ID)).toBe(true);
  });

  it('is false when the question is filtered to a non-other option', () => {
    expect(isOtherFiltered({ [KEY]: ['red'] }, FIELD_ID)).toBe(false);
  });

  it('is false when there is no filter for this question (whole-question insight)', () => {
    expect(
      isOtherFiltered({ input_custom_field_no_empty_values: true }, FIELD_ID)
    ).toBe(false);
  });

  it('is false when the "other" filter is for a different question', () => {
    expect(
      isOtherFiltered({ input_custom_other_id: ['other'] }, FIELD_ID)
    ).toBe(false);
  });

  it('is false when filters are undefined', () => {
    expect(isOtherFiltered(undefined, FIELD_ID)).toBe(false);
  });
});

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
