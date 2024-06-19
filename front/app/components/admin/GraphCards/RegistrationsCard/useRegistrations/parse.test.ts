import moment from 'moment';

import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { parseTimeSeries, parseStats } from './parse';

describe('parseTimeSeries', () => {
  it('works', () => {
    const timeSeries = [
      {
        first_dimension_date_registration_date: '2022-09-29',
        count: 10,
      },
      {
        first_dimension_date_registration_date: '2022-10-02',
        count: 5,
      },
    ];

    const output = parseTimeSeries(
      timeSeries,
      moment('2022-09-01'),
      moment('2022-11-01'),
      'month'
    );

    const expectedOutput = [
      { date: '2022-09-01', registrations: 10 },
      { date: '2022-10-01', registrations: 5 },
      { date: '2022-11-01', registrations: 0 },
    ];

    expect(output).toEqual(expectedOutput);
  });
});

describe('parseStats', () => {
  it('works', () => {
    const response: RegistrationsResponse['data']['attributes'] = [
      [],
      [{ count: 10 }],
      [{ count_visitor_id: 20 }],
      [{ count: 10 }],
      [{ count: 8 }],
      [{ count_visitor_id: 32 }],
      [{ count: 8 }],
    ];

    const expectedOutput = {
      registrations: {
        value: '10',
        lastPeriod: '8',
      },
      registrationRate: {
        value: '50%',
        lastPeriod: '25%',
      },
    };

    expect(parseStats(response)).toEqual(expectedOutput);
  });
});
