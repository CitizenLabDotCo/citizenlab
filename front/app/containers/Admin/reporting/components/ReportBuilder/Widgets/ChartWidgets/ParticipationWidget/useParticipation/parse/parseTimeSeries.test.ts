import moment from 'moment';

import { ParticipationResponse } from 'api/graph_data_units/responseTypes/ParticipationWidget';

import { parseCombinedTimeSeries } from './parseTimeSeries';

describe('parseCombinedTimeSeries', () => {
  it('return null if all time series are empty', () => {
    expect(
      parseCombinedTimeSeries(
        [[], [], [], undefined, undefined, undefined],
        null,
        null,
        'month'
      )
    ).toBe(null);
  });

  it('returns correct combined time series', () => {
    const responseAttributes: ParticipationResponse['data']['attributes'] = [
      [{ count: 1, first_dimension_date_created_date: '2022-09-01' }],
      [{ count: 2, first_dimension_date_created_date: '2022-09-01' }],
      [{ count: 3, first_dimension_date_created_date: '2022-09-01' }],
      undefined,
      undefined,
      undefined,
    ];

    const combinedTimeSeries = parseCombinedTimeSeries(
      responseAttributes,
      null,
      null,
      'month'
    );

    expect(combinedTimeSeries).toEqual([
      {
        date: '2022-09-01',
        inputs: 1,
        comments: 2,
        votes: 3,
      },
    ]);
  });

  const responseAttributes: ParticipationResponse['data']['attributes'] = [
    [{ count: 1, first_dimension_date_created_date: '2024-04-21' }],
    [{ count: 2, first_dimension_date_created_date: '2024-05-14' }],
    [],
    undefined,
    undefined,
    undefined,
  ];

  it('works if one time series is empty and they all have different dates', () => {
    const combinedTimeSeries = parseCombinedTimeSeries(
      responseAttributes,
      null,
      null,
      'month'
    );

    expect(combinedTimeSeries).toEqual([
      {
        date: '2024-04-01',
        inputs: 1,
        comments: 0,
        votes: 0,
      },
      {
        date: '2024-05-01',
        inputs: 0,
        comments: 2,
        votes: 0,
      },
    ]);
  });

  it('works with provided start at', () => {
    const combinedTimeSeries = parseCombinedTimeSeries(
      responseAttributes,
      moment('2024-03-05'),
      null,
      'month'
    );

    expect(combinedTimeSeries).toEqual([
      {
        date: '2024-03-01',
        inputs: 0,
        comments: 0,
        votes: 0,
      },
      {
        date: '2024-04-01',
        inputs: 1,
        comments: 0,
        votes: 0,
      },
      {
        date: '2024-05-01',
        inputs: 0,
        comments: 2,
        votes: 0,
      },
    ]);
  });
});
