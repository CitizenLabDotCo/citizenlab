import moment from 'moment';

import { Query } from 'api/analytics/types';

import { StatCardData } from '../StatCard/useStatCard/typings';

import { ProposalsCardLabels, proposalsConfig } from './config';

describe('Proposals card data parsing', () => {
  beforeAll(() => {
    // Set 'now' as a fixed date - 2022-10-31
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date('2022-10-31T00:00:00.000Z').getTime();
    });
  });

  it('Transforms data correctly into data format required by the proposals stat card', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Proposals',
      fileName: 'proposals',
      periodLabel: '30 days',
      stats: [
        { value: '3', label: 'Total', lastPeriod: '2' },
        {
          value: '1',
          label: 'Successful',
          lastPeriod: '-',
          toolTip: 'Success tool tip',
        },
      ],
    };

    const responseData = [
      [{ count: 3 }],
      [{ count: 2 }],
      [{ count: 1 }],
      [{ count: 0 }],
    ];

    const labels: ProposalsCardLabels = {
      proposals: 'Proposals',
      periodLabel: '30 days',
      totalProposals: 'Total',
      successfulProposals: 'Successful',
      successfulProposalsToolTip: 'Success tool tip',
    };

    const data = proposalsConfig.dataParser(responseData, labels, undefined);
    //
    // console.log(data);

    expect(data).toEqual(expectedCardData);
  });

  it('Creates the correct proposals query when date & project filters applied', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_project.id': 'PROJECT_ID',
            'dimension_date_created.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
          },
        },
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_project.id': 'PROJECT_ID',
            'dimension_date_created.date': {
              from: '2022-10-24',
              to: '2022-10-31',
            },
          },
        },
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_project.id': 'PROJECT_ID',
            'dimension_status.code': 'threshold_reached',
            'dimension_date_created.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
          },
        },
        {
          fact: 'post',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_project.id': 'PROJECT_ID',
            'dimension_status.code': 'threshold_reached',
            'dimension_date_created.date': {
              from: '2022-10-24',
              to: '2022-10-31',
            },
          },
        },
      ],
    };

    const query = proposalsConfig.queryHandler({
      projectId: 'PROJECT_ID',
      startAtMoment: moment().set('year', 2020),
      endAtMoment: moment().set('year', 2021),
      resolution: 'week',
    });

    expect(query).toEqual(expectedQuery);
  });

  it('Creates the correct proposals query with default filters', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
          },
        },
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            publication_status: 'published',
            'dimension_date_created.date': {
              from: '2022-10-01',
              to: '2022-10-31',
            },
          },
        },
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            'dimension_status.code': 'threshold_reached',
            publication_status: 'published',
          },
        },
        {
          fact: 'post',
          aggregations: { all: 'count' },
          filters: {
            'dimension_type.name': 'initiative',
            'dimension_status.code': 'threshold_reached',
            publication_status: 'published',
            'dimension_date_created.date': {
              from: '2022-10-01',
              to: '2022-10-31',
            },
          },
        },
      ],
    };

    const query = proposalsConfig.queryHandler({
      projectId: undefined,
      startAtMoment: null,
      endAtMoment: null,
      resolution: 'month',
    });

    expect(query).toEqual(expectedQuery);
  });
});
