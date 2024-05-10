import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

import { parseStats } from './parse';

const TIME_SERIES = [];

describe('parseStats', () => {
  it('works when all stats data is empty', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      TIME_SERIES,
      [],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

    const expectedOutput = {
      activeUsers: {
        value: 0,
        delta: undefined,
      },
      participationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('works when only data for active users in whole period', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

    const expectedOutput = {
      activeUsers: {
        value: 4,
        delta: undefined,
      },
      participationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates active users delta', () => {
    const responseData: ActiveUsersResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [],
      [],
      [{ count_participant_id: 1 }],
      undefined,
      undefined,
    ];

    const expectedOutput = {
      activeUsers: {
        value: 4,
        delta: 3,
      },
      participationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates participation rate whole period', () => {
    // TODO
  });

  it('correctly calculates participation rate previous period', () => {
    // TODO
  });
});
