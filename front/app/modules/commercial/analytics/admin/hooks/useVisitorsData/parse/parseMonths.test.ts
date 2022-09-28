import moment from 'moment';
import {
  parseMonths,
  getEmptyMonthsBefore,
  getEmptyMonthsAfter,
  getFirstDayOfMonth
} from './parseMonths'
import { range } from 'lodash-es'
import { TimeSeriesResponse, TimeSeries } from '../typings';

describe('parseMonths', () => {
  const continuousData: TimeSeriesResponse = [
    {
      count: 3,
      count_visitor_id: 3,
      'dimension_date_last_action.month': '2022-01'
    },
    {
      count: 1,
      count_visitor_id: 1,
      'dimension_date_last_action.month': '2021-11'
    },
    {
      count: 4,
      count_visitor_id: 4,
      'dimension_date_last_action.month': '2022-02'
    },
    {
      count: 2,
      count_visitor_id: 2,
      'dimension_date_last_action.month': '2021-12'
    },
  ]

  const dataWithGap: TimeSeriesResponse = [
    continuousData[0], continuousData[1], continuousData[2]
  ];

  const expectedContinuousData: TimeSeries = [
    { date: '2021-11-01', visits: 1, visitors: 1 },
    { date: '2021-12-01', visits: 2, visitors: 2 },
    { date: '2022-01-01', visits: 3, visitors: 3 },
    { date: '2022-02-01', visits: 4, visitors: 4 }
  ]

  const expectedDataWithGap: TimeSeries = [
    { date: '2021-11-01', visits: 1, visitors: 1 },
    { date: '2021-12-01', visits: 0, visitors: 0 },
    { date: '2022-01-01', visits: 3, visitors: 3 },
    { date: '2022-02-01', visits: 4, visitors: 4 }
  ]

  const expectedDataBefore: TimeSeries = [
    {
      date: '2021-09-01',
      visitors: 0,
      visits: 0
    },
    {
      date: '2021-10-01',
      visitors: 0,
      visits: 0
    },
  ]

  const expectedDataAfter: TimeSeries = [
    {
      date: '2022-03-01',
      visitors: 0,
      visits: 0
    },
    {
      date: '2022-04-01',
      visitors: 0,
      visits: 0
    },
  ]

  it('works without start and end date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      null,
      null,
    )

    expect(output).toEqual(expectedContinuousData);
  })

  it('works with only start date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      moment('2021-09-01'),
      null,
    )

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works with only end date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      null,
      moment('2022-04-01'),
    )

    const expectedOutput: TimeSeries = [
      ...expectedContinuousData,
      ...expectedDataAfter
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works with both start and end date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      moment('2021-09-01'),
      moment('2022-04-01'),
    )

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
      ...expectedDataAfter
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works without start and end date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      null,
      null,
    )

    expect(output).toEqual(expectedDataWithGap);
  })

  it('works with only start date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      moment('2021-09-01'),
      null,
    )

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works with only end date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      null,
      moment('2022-04-01'),
    )

    const expectedOutput: TimeSeries = [
      ...expectedDataWithGap,
      ...expectedDataAfter
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works with both start and end date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      moment('2021-09-01'),
      moment('2022-04-01'),
    )

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
      ...expectedDataAfter
    ]

    expect(output).toEqual(expectedOutput);
  })

  it('works with large gap (dataWithGap)', () => {
    const data = [
      {
        'dimension_date_last_action.month': '2021-10',
        count_visitor_id: 1,
        count: 1
      },
      {
        'dimension_date_last_action.month': '2022-02',
        count_visitor_id: 1,
        count: 1
      }
    ]

    const output = parseMonths(
      data,
      null,
      null,
    )

    const expectedOutput = [
      { date: '2021-10-01', visits: 1, visitors: 1 },
      { date: '2021-11-01', visits: 0, visitors: 0 },
      { date: '2021-12-01', visits: 0, visitors: 0 },
      { date: '2022-01-01', visits: 0, visitors: 0 },
      { date: '2022-02-01', visits: 1, visitors: 1 }
    ]

    expect(output).toEqual(expectedOutput)
  })
})


const toEmptyMonth = (year: number) => (month: number) => ({
  visitors: 0,
  visits: 0,
  date: getFirstDayOfMonth(year, month)
})

describe('getEmptyMonthsBefore', () => {
  it('works in same year', () => {
    const output = getEmptyMonthsBefore(
      moment('2022-03-01'),
      moment('2022-09')
    )

    const expectedOutput = range(3, 9).map(toEmptyMonth(2022))

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts one year later', () => {
    const output = getEmptyMonthsBefore(
      moment('2021-03-01'),
      moment('2022-09')
    )

    const expectedOutput = [
      ...range(3, 13).map(toEmptyMonth(2021)),
      ...range(1, 9).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts multiple years later', () => {
    const output = getEmptyMonthsBefore(
      moment('2020-03-01'),
      moment('2022-09')
    )

    const expectedOutput = [
      ...range(3, 13).map(toEmptyMonth(2020)),
      ...range(1, 13).map(toEmptyMonth(2021)),
      ...range(1, 9).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })
})

describe('getEmptyMonthsAfter', () => {
  it('works in same year', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2022-03')
    )

    const expectedOutput = range(4, 10).map(toEmptyMonth(2022))

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts one year later', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2021-03')
    )

    const expectedOutput = [
      ...range(4, 13).map(toEmptyMonth(2021)),
      ...range(1, 10).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })

  it('works if data starts multiple years later', () => {
    const output = getEmptyMonthsAfter(
      moment('2022-09-01'),
      moment('2020-03')
    )

    const expectedOutput = [
      ...range(4, 13).map(toEmptyMonth(2020)),
      ...range(1, 13).map(toEmptyMonth(2021)),
      ...range(1, 10).map(toEmptyMonth(2022))
    ]

    expect(output).toEqual(expectedOutput)
  })
})