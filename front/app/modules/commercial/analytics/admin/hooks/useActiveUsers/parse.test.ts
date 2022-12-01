import { parseStats } from './parse';
import { Response } from './typings';

describe('parseStats', () => {
  it('works', () => {
    const responseData: Response['data'] = [
      [
        {
          'dimension_date_created.month': '2022-09',
          count_dimension_user_id: 1,
        },
        {
          'dimension_date_created.month': '2022-10',
          count_dimension_user_id: 4,
        },
        {
          'dimension_date_created.month': '2022-11',
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
          'dimension_date_created.month': '2022-11',
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
