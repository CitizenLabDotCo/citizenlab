import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { parseStats } from './parse';

const TIME_SERIES = [];

describe('parseStats', () => {
  it('works when all stats data is empty', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: TIME_SERIES,
      participants_whole_period: 0,
      participation_rate_whole_period: 0,
      participants_compared_period: undefined,
      participation_rate_compared_period: undefined,
    };

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
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: TIME_SERIES,
      participants_whole_period: 4,
      participation_rate_whole_period: 0,
      participants_compared_period: undefined,
      participation_rate_compared_period: undefined,
    };

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
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: TIME_SERIES,
      participants_whole_period: 4,
      participation_rate_whole_period: 0,
      participants_compared_period: 1,
      participation_rate_compared_period: 0,
    };

    const expectedOutput = {
      participants: {
        value: 4,
        delta: 3,
      },
      participationRate: {
        value: 0,
        delta: 0,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates participation rate whole period', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: TIME_SERIES,
      participants_whole_period: 4,
      participation_rate_whole_period: 0.5,
      participants_compared_period: undefined,
      participation_rate_compared_period: undefined,
    };

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
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: TIME_SERIES,
      participants_whole_period: 4,
      participation_rate_whole_period: 0.5,
      participants_compared_period: 2,
      participation_rate_compared_period: 0.4,
    };

    const expectedOutput = {
      participants: {
        value: 4,
        delta: 2,
      },
      participationRate: {
        value: 50,
        delta: 10,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
