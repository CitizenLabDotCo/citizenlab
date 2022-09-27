import moment from 'moment';
import { parseTimeSeries } from '.';
import { TimeSeriesResponse, TimeSeries } from '../typings';

describe('parseTimeSeries', () => {
  describe('months', () => {
    const resolution = 'month';
    const continuousData: TimeSeriesResponse = [
      {
        count: 2,
        count_visitor_id: 2,
        'dimension_date_last_action.month': '2022-01'
      },
      {
        count: 0,
        count_visitor_id: 0,
        'dimension_date_last_action.month': '2021-11'
      },
      {
        count: 3,
        count_visitor_id: 3,
        'dimension_date_last_action.month': '2022-02'
      },
      {
        count: 1,
        count_visitor_id: 1,
        'dimension_date_last_action.month': '2021-12'
      },
    ]

    const expectedParsedContinuousData: TimeSeries = [
      { date: '2021-11-01', visits: 0, visitors: 0 },
      { date: '2021-12-01', visits: 1, visitors: 1 },
      { date: '2022-01-01', visits: 2, visitors: 2 },
      { date: '2022-02-01', visits: 3, visitors: 3 }
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

    // const dataWithGap: TimeSeriesResponse = [
    //   continuousData[0], continuousData[1], continuousData[2]
    // ];

    it('works without start and end date (continuousData)', () => {
      const output = parseTimeSeries(
        continuousData,
        null,
        null,
        resolution
      )

      expect(output).toEqual(expectedParsedContinuousData);
    })

    it('works with only start date (continuousData)', () => {
      const output = parseTimeSeries(
        continuousData,
        moment('2021-09-01'),
        null,
        resolution
      )

      const expectedOutput: TimeSeries = [
        ...expectedDataBefore,
        ...expectedParsedContinuousData
      ]

      expect(output).toEqual(expectedOutput);
    })

    it('works with only end date (continuousData)', () => {
      const output = parseTimeSeries(
        continuousData,
        null,
        moment('2022-04-01'),
        resolution
      )

      const expectedOutput: TimeSeries = [
        ...expectedParsedContinuousData,
        ...expectedDataAfter
      ]

      expect(output).toEqual(expectedOutput);
    })

    it('works with both start and end date (continuousData)', () => {
      const output = parseTimeSeries(
        continuousData,
        moment('2021-09-01'),
        moment('2022-04-01'),
        resolution
      )

      const expectedOutput: TimeSeries = [
        ...expectedDataBefore,
        ...expectedParsedContinuousData,
        ...expectedDataAfter
      ]

      expect(output).toEqual(expectedOutput);
    })

    // it('works without start and end date (dataWithGap)', () => {

    // })

    // it('works with only start date (dataWithGap)', () => {

    // })

    // it('works with only end date (dataWithGap)', () => {

    // })

    // it('works with both start and end date (dataWithGap)', () => {

    // })
  })
})
