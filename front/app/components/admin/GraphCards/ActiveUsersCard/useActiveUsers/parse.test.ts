import moment from 'moment';

import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

import { parseTimeSeries, parseStats } from './parse';

describe('parseTimeSeries', () => {
  it('works', () => {
    const timeSeries = [
      {
        first_dimension_date_created_date: '2022-10-01',
        count_participant_id: 4,
      },
      {
        first_dimension_date_created_date: '2022-09-02',
        count_participant_id: 1,
      },
      {
        first_dimension_date_created_date: '2022-11-14',
        count_participant_id: 3,
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
      [],
      [{ count_participant_id: 8 }],
      [{ count_visitor_id: 4 }],
      [{ count_participant_id: 2 }],

      [{ count_participant_id: 6 }],
      [{ count_visitor_id: 4 }],
      [{ count_participant_id: 1 }],
    ];

    const expectedOutput = {
      activeUsers: {
        value: '8',
        lastPeriod: '6',
      },
      participationRate: {
        value: '50%',
        lastPeriod: '25%',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('works when last period visitors is empty array', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      [
        {
          first_dimension_date_created_date: '2022-11-09',
          count_participant_id: 3,
        },
      ],
      [{ count_participant_id: 3 }],
      [{ count_visitor_id: 1 }],
      [{ count_participant_id: 1 }],

      [{ count_participant_id: 3 }],
      [],
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
