import moment from 'moment';
import { parseTimeSeries, parseStats } from './parse';
import { Response } from './typings';

describe('parseTimeSeries', () => {
  it('works', () => {
    const timeSeries = [
      {
        first_dimension_date_created_date: '2022-10-01',
        count_dimension_user_id: 4,
      },
      {
        first_dimension_date_created_date: '2022-09-02',
        count_dimension_user_id: 1,
      },
      {
        first_dimension_date_created_date: '2022-11-14',
        count_dimension_user_id: 3,
      },
    ];

    const output = parseTimeSeries(
      timeSeries,
      moment('2022-09-01'),
      moment('2022-12-01'),
      'month'
    );

    const expectedOutput = [
      {
        date: '2022-09-01',
        activeUsers: 1,
      },
      {
        date: '2022-10-01',
        activeUsers: 4,
      },
      {
        date: '2022-11-01',
        activeUsers: 3,
      },
      {
        date: '2022-12-01',
        activeUsers: 0,
      },
    ];

    expect(output).toEqual(expectedOutput);
  });
});

describe('parseStats', () => {
  it('works', () => {
    const responseData: Response['data'] = [
      [
        {
          first_dimension_date_created_date: '2022-09-02',
          count_dimension_user_id: 1,
        },
        {
          first_dimension_date_created_date: '2022-10-01',
          count_dimension_user_id: 4,
        },
        {
          first_dimension_date_created_date: '2022-11-14',
          count_dimension_user_id: 3,
        },
      ],
      [{ count_dimension_user_id: 4 }],
      [{ count_dimension_user_id: 4 }],
      [{ count_visitor_id: 2 }],
      [{ count_visitor_id: 0 }],
    ];

    const expectedOutput = {
      activeUsers: {
        value: '4',
        lastPeriod: '4',
      },
      participationRate: {
        value: '100%',
        lastPeriod: '0%',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('works with last query response as empty array', () => {
    const responseData: Response['data'] = [
      [
        {
          first_dimension_date_created_date: '2022-11-09',
          count_dimension_user_id: 3,
        },
      ],
      [{ count_dimension_user_id: 3 }],
      [{ count_dimension_user_id: 3 }],
      [{ count_visitor_id: 1 }],
      [],
    ];

    const expectedOutput = {
      activeUsers: {
        value: '3',
        lastPeriod: '3',
      },
      participationRate: {
        value: '100%',
        lastPeriod: '0%',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
