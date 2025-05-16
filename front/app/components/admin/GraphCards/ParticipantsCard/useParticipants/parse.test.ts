import moment from 'moment';

import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';

import { parseTimeSeries, parseStats } from './parse';

describe('parseTimeSeries', () => {
  it('works', () => {
    const timeSeries = [
      {
        date_group: '2022-10-01',
        participants: 4,
      },
      {
        date_group: '2022-09-01',
        participants: 1,
      },
      {
        date_group: '2022-11-01',
        participants: 3,
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
        participants: 1,
      },
      {
        date: '2022-10-01',
        participants: 4,
      },
      {
        date: '2022-11-01',
        participants: 3,
      },
      {
        date: '2022-12-01',
        participants: 0,
      },
    ];

    expect(output).toEqual(expectedOutput);
  });
});

describe('parseStats', () => {
  it('works', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: [],
      participants_whole_period: 8,
      participation_rate_whole_period: 0.5,
      participants_compared_period: 6,
      participation_rate_compared_period: 0.25,
    };

    const expectedOutput = {
      participants: {
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

  it('works when last period had no visitors', () => {
    const responseData: ParticipantsResponse['data']['attributes'] = {
      participants_timeseries: [],
      participants_whole_period: 3,
      participation_rate_whole_period: 1,
      participants_compared_period: 3,
      participation_rate_compared_period: 0,
    };

    const expectedOutput = {
      participants: {
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
