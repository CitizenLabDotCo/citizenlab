import moment from 'moment';

import { RegistrationsResponse } from 'api/graph_data_units/responseTypes/RegistrationsWidget';

import { parseTimeSeries, parseStats } from './parse';

describe('parseTimeSeries', () => {
  it('works', () => {
    const timeSeries: RegistrationsResponse['data']['attributes']['registrations_timeseries'] =
      [
        {
          date_group: '2022-09-01',
          registrations: 10,
        },
        {
          date_group: '2022-10-01',
          registrations: 5,
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
    const response: RegistrationsResponse['data']['attributes'] = {
      registrations_timeseries: [],
      registrations_whole_period: 10,
      registration_rate_whole_period: 0.5,
      registrations_compared_period: 8,
      registration_rate_compared_period: 0.25,
    };

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
