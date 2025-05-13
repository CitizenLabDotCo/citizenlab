import moment from 'moment';

import { Query } from 'api/analytics/types';

import { StatCardData } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import { EventsCardLabels, eventsConfig } from './config';

describe('Events card data parsing', () => {
  beforeAll(() => {
    // Set 'now' as a fixed date - 2022-10-31
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date('2022-10-31T00:00:00.000Z').getTime();
    });
  });

  it('Transforms data correctly into data format required by the events stat card', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Events',
      fileName: 'events',
      stats: [
        {
          label: 'Total',
          value: '3',
        },
        {
          label: 'Upcoming',
          value: '2',
        },
        {
          label: 'Completed',
          value: '1',
        },
      ],
    };

    const responseData = [[{ count: 3 }], [{ count: 2 }], [{ count: 1 }]];

    const labels: EventsCardLabels = {
      events: 'Events',
      periodLabel: '30 days',
      totalEvents: 'Total',
      upcoming: 'Upcoming',
      completed: 'Completed',
    };

    const data = eventsConfig.dataParser(responseData, labels, undefined);

    expect(data).toEqual(expectedCardData);
  });

  it('Only transforms total & completed when only 2 values present in response data', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Events',
      fileName: 'events',
      stats: [
        {
          label: 'Total',
          value: '3',
        },
        {
          label: 'Completed',
          value: '1',
        },
      ],
    };

    const responseData = [[{ count: 3 }], [{ count: 1 }]];

    const labels: EventsCardLabels = {
      events: 'Events',
      periodLabel: '30 days',
      totalEvents: 'Total',
      upcoming: 'Upcoming',
      completed: 'Completed',
    };

    const data = eventsConfig.dataParser(responseData, labels, undefined);

    expect(data).toEqual(expectedCardData);
  });

  it('Creates the correct events query when date & project filters applied', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'event',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_created.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
            'dimension_project.id': 'PROJECT_ID',
          },
        },
        {
          fact: 'event',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_end.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
            'dimension_project.id': 'PROJECT_ID',
          },
        },
      ],
    };

    const query = eventsConfig.queryHandler({
      projectId: 'PROJECT_ID',
      startAtMoment: moment().set('year', 2020),
      endAtMoment: moment().set('year', 2021),
      resolution: 'week',
    });

    expect(query).toEqual(expectedQuery);
  });

  it('Creates the correct events query with default filters', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'event',
          aggregations: {
            all: 'count',
          },
        },
        {
          fact: 'event',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_start.date': {
              from: '2022-10-31',
              to: '2030-10-31',
            },
          },
        },
        {
          fact: 'event',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_end.date': {
              from: '2010-10-31',
              to: '2022-10-31',
            },
          },
        },
      ],
    };

    const query = eventsConfig.queryHandler({
      projectId: undefined,
      startAtMoment: null,
      endAtMoment: null,
      resolution: 'month',
    });

    expect(query).toEqual(expectedQuery);
  });
});
