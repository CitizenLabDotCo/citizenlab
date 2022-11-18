import { mergeTimeSeries } from './parse';

describe('Email deliveries data parsing', () => {
  it('Create time series from grouped results', () => {
    const queryResponse = [
      {
        'dimension_date_sent.month': '2022-11',
        automated: true,
        count: 1,
      },
      {
        'dimension_date_sent.month': '2022-11',
        automated: false,
        count: 2,
      },
      {
        'dimension_date_sent.month': '2022-10',
        automated: true,
        count: 3,
      },
      {
        'dimension_date_sent.month': '2022-10',
        automated: false,
        count: 4,
      },
    ];

    const timeSeries = [
      {
        'dimension_date_sent.month': '2022-11',
        automated: 1,
        custom: 2,
      },
      {
        'dimension_date_sent.month': '2022-10',
        automated: 3,
        custom: 4,
      },
    ];

    const data = mergeTimeSeries(queryResponse, 'dimension_date_sent.month');

    expect(data).toEqual(timeSeries);
  });
});
