import { parseTimeSeries } from './parse';
import { TimeSeriesResponse, TimeSeries } from './typings';

describe('parseTimeSeries', () => {
  describe('months', () => {
    const resolution = 'month';
    const continuousData: TimeSeriesResponse = [
      {
        count: 0,
        count_visitor_id: 0,
        'dimension_date_last_action.month': '2021-11'
      },
      {
        count: 1,
        count_visitor_id: 1,
        'dimension_date_last_action.month': '2021-12'
      },
      {
        count: 2,
        count_visitor_id: 2,
        'dimension_date_last_action.month': '2022-01'
      },
      {
        count: 3,
        count_visitor_id: 3,
        'dimension_date_last_action.month': '2022-02'
      },
    ]

    // const dataWithGap: TimeSeriesResponse = [
    //   continuousData[0], continuousData[1], continuousData[3]
    // ];
    
    it('works without start and end date (continuousData)', () => {
      const output = parseTimeSeries(
        continuousData,
        null,
        null,
        resolution
      )

      const expectedOutput: TimeSeries = continuousData.map((row) => ({
        date: `${row['dimension_date_last_action.month']}-01`,
        visits: row.count,
        visitors: row.count_visitor_id
      }))

      expect(output).toEqual(expectedOutput);
    })

    it('works with only start date (continuousData)', () => {
      
    })

    it('works with only end date (continuousData)', () => {
      
    })

    it('works with both start and end date (continuousData)', () => {

    })

    it('works without start and end date (dataWithGap)', () => {

    })

    it('works with only start date (dataWithGap)', () => {
      
    })

    it('works with only end date (dataWithGap)', () => {
      
    })

    it('works with both start and end date (dataWithGap)', () => {
      
    })
  })
})