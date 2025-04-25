import {
  getQuarterFilter,
  getYearFilter,
} from 'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils';

import { getPublishedAtFromFilter, getPublishedAtToFilter } from './utils';

jest.mock(
  'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils',
  () => {
    const actual = jest.requireActual(
      'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils'
    );
    return {
      ...actual,
      getYearFilter: jest.fn(),
      getQuarterFilter: jest.fn(),
    };
  }
);

describe('getPublishedAtFromFilter', () => {
  it('returns correct start date for Q1', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2025');
    (getQuarterFilter as jest.Mock).mockReturnValue('1');

    const result = getPublishedAtFromFilter(new URLSearchParams());
    expect(result).toBe('2025-01-01');
  });

  it('returns correct start date for Q3', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2024');
    (getQuarterFilter as jest.Mock).mockReturnValue('3');

    const result = getPublishedAtFromFilter(new URLSearchParams());
    expect(result).toBe('2024-07-01');
  });

  it('returns undefined when year is missing', () => {
    (getYearFilter as jest.Mock).mockReturnValue(null);
    (getQuarterFilter as jest.Mock).mockReturnValue('2');

    const result = getPublishedAtFromFilter(new URLSearchParams());
    expect(result).toBeUndefined();
  });

  it('returns undefined when quarter is missing', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2024');
    (getQuarterFilter as jest.Mock).mockReturnValue(null);

    const result = getPublishedAtFromFilter(new URLSearchParams());
    expect(result).toBeUndefined();
  });
});

describe('getPublishedAtToFilter', () => {
  it('returns correct end date for Q1', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2025');
    (getQuarterFilter as jest.Mock).mockReturnValue('1');

    const result = getPublishedAtToFilter(new URLSearchParams());
    expect(result).toBe('2025-03-31');
  });

  it('returns correct end date for Q4', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2023');
    (getQuarterFilter as jest.Mock).mockReturnValue('4');

    const result = getPublishedAtToFilter(new URLSearchParams());
    expect(result).toBe('2023-12-31');
  });

  it('returns undefined when year is missing', () => {
    (getYearFilter as jest.Mock).mockReturnValue(null);
    (getQuarterFilter as jest.Mock).mockReturnValue('2');

    const result = getPublishedAtToFilter(new URLSearchParams());
    expect(result).toBeUndefined();
  });

  it('returns undefined when quarter is missing', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2024');
    (getQuarterFilter as jest.Mock).mockReturnValue(null);

    const result = getPublishedAtToFilter(new URLSearchParams());
    expect(result).toBeUndefined();
  });
});
