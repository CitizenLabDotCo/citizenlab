import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { parseStats } from './parse';

const TIME_SERIES = [];

describe('parseStats', () => {
  it('works when all stats data is empty', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: [],
      registrations_whole_period: 0,
      registration_rate_whole_period: 0,
    };

    const expectedOutput = {
      registrations: {
        value: 0,
        delta: undefined,
      },
      registrationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('works when only data for registrations in whole period', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: TIME_SERIES,
      registrations_whole_period: 4,
      registration_rate_whole_period: 0,
    };

    const expectedOutput = {
      registrations: {
        value: 4,
        delta: undefined,
      },
      registrationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates registrations delta', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: TIME_SERIES,
      registrations_whole_period: 4,
      registration_rate_whole_period: 0,
      registrations_compared_period: 1,
      registration_rate_compared_period: 0,
    };

    const expectedOutput = {
      registrations: {
        value: 4,
        delta: 3,
      },
      registrationRate: {
        value: 0,
        delta: 0,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates registration rate whole period', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: TIME_SERIES,
      registrations_whole_period: 4,
      registration_rate_whole_period: 0.5,
    };

    const expectedOutput = {
      registrations: {
        value: 4,
        delta: undefined,
      },
      registrationRate: {
        value: 50,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates registration rate previous period', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: TIME_SERIES,
      registrations_whole_period: 4,
      registration_rate_whole_period: 0.5,
      registrations_compared_period: 3,
      registration_rate_compared_period: 0.4,
    };

    const expectedOutput = {
      registrations: {
        value: 4,
        delta: 1,
      },
      registrationRate: {
        value: 50,
        delta: 10,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });
});
