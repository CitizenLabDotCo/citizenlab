import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { parseStats } from './parse';

const TIME_SERIES = [];

describe('parseStats', () => {
  it('works when all stats data is empty', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = [
      TIME_SERIES,
      [],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

    const expectedOutput = {
      participants: {
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

  it('works when only data for participants in whole period', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

    const expectedOutput = {
      participants: {
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

  it('correctly calculates participants delta', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [],
      [],
      [{ count_participant_id: 1 }],
      undefined,
      undefined,
    ];

    const expectedOutput = {
      participants: {
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
    const responseData: ParticipantsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [{ count_visitor_id: 6 }],
      [{ count_participant_id: 3 }],
      undefined,
      undefined,
      undefined,
    ];

    const expectedOutput = {
      participants: {
        value: 4,
        delta: undefined,
      },
      participationRate: {
        value: 50,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates participation rate previous period', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count_participant_id: 4 }],
      [{ count_visitor_id: 6 }],
      [{ count_participant_id: 3 }],
      [{ count_participant_id: 3 }],
      [{ count_visitor_id: 5 }],
      [{ count_participant_id: 2 }],
    ];

    const expectedOutput = {
      participants: {
        value: 4,
        delta: 1,
      },
      participationRate: {
        value: 50,
        delta: 10,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
