import { mergeTimeSeries } from './parse';

describe('Email deliveries data parsing', () => {
  it('Create time series from grouped results', () => {
    const queryResponse = [
      {
        first_dimension_date_sent_date: '2022-11-02',
        automated: true,
        count: 1,
      },
      {
        first_dimension_date_sent_date: '2022-11-01',
        automated: false,
        count: 2,
      },
      {
        first_dimension_date_sent_date: '2022-10-29',
        automated: true,
        count: 3,
      },
      {
        first_dimension_date_sent_date: '2022-10-03',
        automated: false,
        count: 4,
      },
    ];

    const timeSeries = [
      {
        first_dimension_date_sent_date: '2022-11-01',
        automated: 1,
        custom: 2,
      },
      {
        first_dimension_date_sent_date: '2022-10-02',
        automated: 3,
        custom: 4,
      },
    ];

    const data = mergeTimeSeries(queryResponse);

    expect(data).toEqual(timeSeries);
  });
});
