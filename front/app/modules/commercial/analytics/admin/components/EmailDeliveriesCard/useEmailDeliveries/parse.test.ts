import moment from 'moment';

import { mergeTimeSeries, parseTimeSeries } from './parse';

describe('mergeTimeSeries', () => {
  it('Create time series from day grouped results', () => {
    const queryResponse = [
      {
        first_dimension_date_sent_date: '2022-11-02',
        automated: true,
        count: 1,
      },
      {
        first_dimension_date_sent_date: '2022-11-02',
        automated: false,
        count: 2,
      },
      {
        first_dimension_date_sent_date: '2022-10-29',
        automated: true,
        count: 3,
      },
      {
        first_dimension_date_sent_date: '2022-10-29',
        automated: false,
        count: 4,
      },
    ];

    const expectedOutput = [
      {
        first_dimension_date_sent_date: '2022-11-02',
        automated: 1,
        custom: 2,
      },
      {
        first_dimension_date_sent_date: '2022-10-29',
        automated: 3,
        custom: 4,
      },
    ];

    expect(mergeTimeSeries(queryResponse, 'day')).toEqual(expectedOutput);
  });

  it('Create time series from week grouped results', () => {
    const queryResponse = [
      {
        first_dimension_date_sent_week: '2022-11-02',
        automated: true,
        count: 1,
      },
      {
        first_dimension_date_sent_week: '2022-11-02',
        automated: false,
        count: 2,
      },
      {
        first_dimension_date_sent_week: '2022-10-29',
        automated: true,
        count: 3,
      },
      {
        first_dimension_date_sent_week: '2022-10-29',
        automated: false,
        count: 4,
      },
    ];

    const expectedOutput = [
      {
        first_dimension_date_sent_week: '2022-11-02',
        automated: 1,
        custom: 2,
      },
      {
        first_dimension_date_sent_week: '2022-10-29',
        automated: 3,
        custom: 4,
      },
    ];

    expect(mergeTimeSeries(queryResponse, 'week')).toEqual(expectedOutput);
  });

  it('Create time series from week grouped results', () => {
    const queryResponse = [
      {
        first_dimension_date_sent_month: '2022-11-01',
        automated: true,
        count: 1,
      },
      {
        first_dimension_date_sent_month: '2022-11-01',
        automated: false,
        count: 2,
      },
      {
        first_dimension_date_sent_month: '2022-10-01',
        automated: true,
        count: 3,
      },
      {
        first_dimension_date_sent_month: '2022-10-01',
        automated: false,
        count: 4,
      },
    ];

    const expectedOutput = [
      {
        first_dimension_date_sent_month: '2022-11-01',
        automated: 1,
        custom: 2,
      },
      {
        first_dimension_date_sent_month: '2022-10-01',
        automated: 3,
        custom: 4,
      },
    ];

    expect(mergeTimeSeries(queryResponse, 'month')).toEqual(expectedOutput);
  });

  it('returns empty array if input is empty array', () => {
    expect(mergeTimeSeries([], 'day')).toEqual([]);
  });
});

describe('parseTimeSeries', () => {
  const preparedTimeSeriesResponse = [
    {
      first_dimension_date_sent_date: '2022-11-02',
      automated: 1,
      custom: 2,
    },
    {
      first_dimension_date_sent_date: '2022-10-29',
      automated: 3,
      custom: 4,
    },
  ];

  it('works correctly for months', () => {
    const output = parseTimeSeries(
      preparedTimeSeriesResponse,
      moment('2022-09-01'),
      moment('2022-12-01'),
      'month'
    );

    const expectedOutput = [
      {
        date: '2022-09-01',
        automated: 0,
        custom: 0,
      },
      {
        date: '2022-10-01',
        automated: 3,
        custom: 4,
      },
      {
        date: '2022-11-01',
        automated: 1,
        custom: 2,
      },
      {
        date: '2022-12-01',
        automated: 0,
        custom: 0,
      },
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works correctly for weeks', () => {
    const output = parseTimeSeries(
      preparedTimeSeriesResponse,
      moment('2022-10-24'),
      moment('2022-11-07'),
      'week'
    );

    const expectedOutput = [
      {
        date: '2022-10-24',
        automated: 3,
        custom: 4,
      },
      {
        date: '2022-10-31',
        automated: 1,
        custom: 2,
      },
      {
        date: '2022-11-07',
        automated: 0,
        custom: 0,
      },
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works correctly for days', () => {
    const output = parseTimeSeries(
      preparedTimeSeriesResponse,
      moment('2022-10-29'),
      moment('2022-11-02'),
      'day'
    );

    const expectedOutput = [
      {
        date: '2022-10-29',
        automated: 3,
        custom: 4,
      },
      {
        date: '2022-10-30',
        automated: 0,
        custom: 0,
      },
      {
        date: '2022-10-31',
        automated: 0,
        custom: 0,
      },
      {
        date: '2022-11-01',
        automated: 0,
        custom: 0,
      },
      {
        date: '2022-11-02',
        automated: 1,
        custom: 2,
      },
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('returns null if time series is empty array', () => {
    const output = parseTimeSeries(
      [],
      moment('2022-09-01'),
      moment('2022-12-01'),
      'month'
    );

    expect(output).toBe(null);
  });
});
