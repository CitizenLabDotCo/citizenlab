import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

import { parseStats } from './parse';

describe('parseStats', () => {
  it('works', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      [
        {
          first_dimension_date_created_date: '2022-09-02',
          count_participant_id: 1,
        },
        {
          first_dimension_date_created_date: '2022-10-01',
          count_participant_id: 4,
        },
        {
          first_dimension_date_created_date: '2022-11-14',
          count_participant_id: 3,
        },
      ],
      [{ count_participant_id: 4 }],
      [],
      undefined,
      undefined,
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
          count_participant_id: 3,
        },
      ],
      [{ count_participant_id: 3 }],
      [],
      undefined,
      undefined,
    ];

    const expectedOutput = {
      activeUsers: {
        value: '3',
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
