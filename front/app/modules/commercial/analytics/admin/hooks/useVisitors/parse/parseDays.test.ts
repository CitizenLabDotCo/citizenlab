import moment from 'moment';
import { parseDays } from './parseDays';
import { TimeSeriesResponse, TimeSeries } from '../typings';

describe('parseDays', () => {
  it('works', () => {
    const data: TimeSeriesResponse = [
      {
        'dimension_date_last_action.date': '2021-12-30',
        count: 1,
        count_visitor_id: 1,
      },
      {
        'dimension_date_last_action.date': '2022-01-02',
        count: 1,
        count_visitor_id: 1,
      },
    ];

    const expectedOutput: TimeSeries = [
      {
        date: '2021-12-28',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2021-12-29',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2021-12-30',
        visitors: 1,
        visits: 1,
      },
      {
        date: '2021-12-31',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2022-01-01',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2022-01-02',
        visitors: 1,
        visits: 1,
      },
      {
        date: '2022-01-03',
        visitors: 0,
        visits: 0,
      },
    ];

    expect(parseDays(data, moment('2021-12-28'), moment('2022-01-03'))).toEqual(
      expectedOutput
    );
  });
});
