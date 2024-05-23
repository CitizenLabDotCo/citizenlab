import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

import { parseStats } from './parse';

describe('parseStats', () => {
  it('works when everything is missing', () => {
    const attributes: VisitorsResponse['data']['attributes'] = [
      [],
      [],
      [],
      undefined,
      undefined,
    ];

    const result = parseStats(attributes);

    expect(result).toEqual({
      visitors: {
        value: 0,
        delta: undefined,
      },
      visits: {
        value: 0,
        delta: undefined,
      },
      visitDuration: {
        value: '00:00:00',
        delta: undefined,
      },
      pageViews: {
        value: '0',
        delta: undefined,
      },
    });
  });

  it('works for current period', () => {
    const attributes: VisitorsResponse['data']['attributes'] = [
      [],
      [{ count: 10, count_monthly_user_hash: 5 }],
      [{ avg_duration: '100', avg_pages_visited: '7' }],
      undefined,
      undefined,
    ];

    const result = parseStats(attributes);

    expect(result).toEqual({
      visitors: {
        value: 5,
        delta: undefined,
      },
      visits: {
        value: 10,
        delta: undefined,
      },
      visitDuration: {
        value: '00:01:40',
        delta: undefined,
      },
      pageViews: {
        value: '7',
        delta: undefined,
      },
    });
  });

  it('works with compared period', () => {
    const attributes: VisitorsResponse['data']['attributes'] = [
      [],
      [{ count: 10, count_monthly_user_hash: 5 }],
      [{ avg_duration: '200', avg_pages_visited: '7' }],
      [{ count: 4, count_monthly_user_hash: 3 }],
      [{ avg_duration: '90', avg_pages_visited: '5' }],
    ];

    const result = parseStats(attributes);

    expect(result).toEqual({
      visitors: {
        value: 5,
        delta: 2,
      },
      visits: {
        value: 10,
        delta: 6,
      },
      visitDuration: {
        value: '00:03:20',
        delta: '00:01:50',
      },
      pageViews: {
        value: '7',
        delta: '2',
      },
    });
  });

  it('works if avg_duration and avg_pages_visited deltas are negative', () => {
    const attributes: VisitorsResponse['data']['attributes'] = [
      [],
      [{ count: 4, count_monthly_user_hash: 3 }],
      [{ avg_duration: '90', avg_pages_visited: '5' }],
      [{ count: 10, count_monthly_user_hash: 5 }],
      [{ avg_duration: '200', avg_pages_visited: '7' }],
    ];

    const result = parseStats(attributes);

    expect(result).toEqual({
      visitors: {
        value: 3,
        delta: -2,
      },
      visits: {
        value: 4,
        delta: -6,
      },
      visitDuration: {
        value: '00:01:30',
        delta: '-00:01:50',
      },
      pageViews: {
        value: '5',
        delta: '-2',
      },
    });
  });
});
