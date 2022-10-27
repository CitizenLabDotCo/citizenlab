import moment from 'moment';
import { parseWeeks } from './parseWeeks';
import { TimeSeriesResponse, TimeSeries } from '../typings';

describe('parseWeeks', () => {
  const continuousData: TimeSeriesResponse = [
    {
      count: 3,
      count_visitor_id: 3,
      'dimension_date_last_action.month': '2022-01-03',
    },
    {
      count: 1,
      count_visitor_id: 1,
      'dimension_date_last_action.week': '2021-12-20',
    },
    {
      count: 4,
      count_visitor_id: 4,
      'dimension_date_last_action.month': '2022-01-10',
    },
    {
      count: 2,
      count_visitor_id: 2,
      'dimension_date_last_action.month': '2021-12-27',
    },
  ];

  const dataWithGap: TimeSeriesResponse = [
    continuousData[0],
    continuousData[1],
    continuousData[2],
  ];

  const expectedContinuousData: TimeSeries = [
    { date: '2021-12-20', visits: 1, visitors: 1 },
    { date: '2021-12-27', visits: 2, visitors: 2 },
    { date: '2022-01-03', visits: 3, visitors: 3 },
    { date: '2022-01-10', visits: 4, visitors: 4 },
  ];

  const expectedDataWithGap: TimeSeries = [
    { date: '2021-12-20', visits: 1, visitors: 1 },
    { date: '2021-12-27', visits: 0, visitors: 0 },
    { date: '2022-01-03', visits: 3, visitors: 3 },
    { date: '2022-01-10', visits: 4, visitors: 4 },
  ];

  const startMoment = moment('2021-12-08');
  const endMoment = moment('2022-01-27');

  const expectedDataBefore: TimeSeries = [
    {
      date: '2021-12-06',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2021-12-13',
      visitors: 0,
      visits: 0,
    },
  ];

  const expectedDataAfter: TimeSeries = [
    {
      date: '2022-01-17',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2022-01-24',
      visitors: 0,
      visits: 0,
    },
  ];

  it('works without start and end date (continuousData)', () => {
    const output = parseWeeks(continuousData, null, null);

    expect(output).toEqual(expectedContinuousData);
  });

  it('works with only start date (continuousData)', () => {
    const output = parseWeeks(continuousData, startMoment, null);

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (continuousData)', () => {
    const output = parseWeeks(continuousData, null, endMoment);

    const expectedOutput: TimeSeries = [
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (continuousData)', () => {
    const output = parseWeeks(continuousData, startMoment, endMoment);

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works without start and end date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, null, null);

    expect(output).toEqual(expectedDataWithGap);
  });

  it('works with only start date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, startMoment, null);

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, null, endMoment);

    const expectedOutput: TimeSeries = [
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, startMoment, endMoment);

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with large gap', () => {
    const data = [
      {
        'dimension_date_last_action.month': '2022-01-03',
        count_visitor_id: 1,
        count: 1,
      },
      {
        'dimension_date_last_action.month': '2022-02-07',
        count_visitor_id: 1,
        count: 1,
      },
    ];

    const output = parseWeeks(data, null, null);

    const expectedOutput = [
      { date: '2022-01-03', visits: 1, visitors: 1 },
      { date: '2022-01-10', visits: 0, visitors: 0 },
      { date: '2022-01-17', visits: 0, visitors: 0 },
      { date: '2022-01-24', visits: 0, visitors: 0 },
      { date: '2022-01-31', visits: 0, visitors: 0 },
      { date: '2022-02-07', visits: 1, visitors: 1 },
    ];

    expect(output).toEqual(expectedOutput);
  });
});
