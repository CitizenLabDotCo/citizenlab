import { VisitorsResponse } from 'api/graph_data_units/responseTypes/VisitorsWidget';

import { parseStats } from './parse';

describe('parseStats', () => {
  it('works when everything is missing', () => {
    const attributes: VisitorsResponse['data']['attributes'] = {
      visitors_timeseries: [],
      visits_whole_period: 0,
      visitors_whole_period: 0,
      avg_pages_visited_whole_period: 0,
      avg_seconds_per_session_whole_period: 0,
    };

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
    const attributes: VisitorsResponse['data']['attributes'] = {
      visitors_timeseries: [],
      visits_whole_period: 10,
      visitors_whole_period: 5,
      avg_seconds_per_session_whole_period: 100,
      avg_pages_visited_whole_period: 7,
    };

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
    const attributes: VisitorsResponse['data']['attributes'] = {
      visitors_timeseries: [],
      visits_whole_period: 10,
      visitors_whole_period: 5,
      avg_seconds_per_session_whole_period: 200,
      avg_pages_visited_whole_period: 7,
      visits_compared_period: 4,
      visitors_compared_period: 3,
      avg_seconds_per_session_compared_period: 90,
      avg_pages_visited_compared_period: 5,
    };

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
    const attributes: VisitorsResponse['data']['attributes'] = {
      visitors_timeseries: [],
      visits_whole_period: 4,
      visitors_whole_period: 3,
      avg_seconds_per_session_whole_period: 90,
      avg_pages_visited_whole_period: 5,
      visits_compared_period: 10,
      visitors_compared_period: 5,
      avg_seconds_per_session_compared_period: 200,
      avg_pages_visited_compared_period: 7,
    };

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
