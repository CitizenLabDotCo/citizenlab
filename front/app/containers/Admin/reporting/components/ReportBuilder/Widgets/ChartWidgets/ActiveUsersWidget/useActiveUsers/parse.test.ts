import moment from 'moment';
import { parseTimeSeries, parseStats } from './parse';
import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes';

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
    const responseData: ActiveUsersResponse['data']['attributes'] = [
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
    ];

    const expectedOutput = {
      activeUsers: {
        value: '4',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('works with last query response as empty array', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      [
        {
          first_dimension_date_created_date: '2022-11-09',
          count_dimension_user_id: 3,
        },
      ],
      [{ count_dimension_user_id: 3 }],
    ];

    const expectedOutput = {
      activeUsers: {
        value: '3',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
