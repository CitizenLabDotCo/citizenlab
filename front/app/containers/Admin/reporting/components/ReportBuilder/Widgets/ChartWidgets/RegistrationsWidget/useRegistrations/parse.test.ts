import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { parseStats } from './parse';

const TIME_SERIES = [];

describe('parseStats', () => {
  it('works when all stats data is empty', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = [
      TIME_SERIES,
      [],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

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
    const responseData: RegistrationsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count: 4 }],
      [],
      [],
      undefined,
      undefined,
      undefined,
    ];

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
    const responseData: RegistrationsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count: 4 }],
      [],
      [],
      [{ count: 1 }],
      undefined,
      undefined,
    ];

    const expectedOutput = {
      registrations: {
        value: 4,
        delta: 3,
      },
      registrationRate: {
        value: 0,
        delta: undefined,
      },
    };

    expect(parseStats(responseData)).toEqual(expectedOutput);
  });

  it('correctly calculates registration rate whole period', () => {
    const responseData: RegistrationsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count: 4 }],
      [{ count_visitor_id: 6 }],
      [{ count: 3 }],
      undefined,
      undefined,
      undefined,
    ];

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
    const responseData: RegistrationsResponse['data']['attributes'] = [
      TIME_SERIES,
      [{ count: 4 }],
      [{ count_visitor_id: 6 }],
      [{ count: 3 }],
      [{ count: 3 }],
      [{ count_visitor_id: 5 }],
      [{ count: 2 }],
    ];

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
