import moment from 'moment';

import { Query } from 'api/analytics/types';

import { StatCardData } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import { InvitationsCardLabels, invitationsConfig } from './config';

describe('Invitations card data parsing', () => {
  beforeAll(() => {
    // Set 'now' as a fixed date - 2022-10-31
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date('2022-10-31T00:00:00.000Z').getTime();
    });
  });

  it('Transforms data correctly into data format required by the invitations stat card', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Invitations',
      fileName: 'invitations',
      periodLabel: '30 days',
      stats: [
        {
          label: 'Total',
          value: '5',
          lastPeriod: '4',
        },
        {
          label: 'Pending',
          value: '3',
        },
        {
          label: 'Accepted',
          value: '2',
          lastPeriod: '1',
        },
      ],
    };

    const responseData = [
      [{ count: 5 }],
      [{ count: 4 }],
      [{ count: 3 }],
      [{ count: 2 }],
      [{ count: 1 }],
    ];

    const labels: InvitationsCardLabels = {
      invitations: 'Invitations',
      periodLabel: '30 days',
      totalInvites: 'Total',
      pending: 'Pending',
      accepted: 'Accepted',
    };

    const data = invitationsConfig.dataParser(responseData, labels, undefined);

    expect(data).toEqual(expectedCardData);
  });

  it('Only transforms total & accepted when only 4 values present in response data', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Invitations',
      fileName: 'invitations',
      periodLabel: 'Yesterday',
      stats: [
        {
          label: 'Total',
          value: '4',
          lastPeriod: '3',
        },
        {
          label: 'Accepted',
          value: '2',
          lastPeriod: '1',
        },
      ],
    };

    const responseData = [
      [{ count: 4 }],
      [{ count: 3 }],
      [{ count: 2 }],
      [{ count: 1 }],
    ];

    const labels: InvitationsCardLabels = {
      invitations: 'Invitations',
      periodLabel: 'Yesterday',
      totalInvites: 'Total',
      pending: 'Pending',
      accepted: 'Accepted',
    };

    const data = invitationsConfig.dataParser(responseData, labels, undefined);

    expect(data).toEqual(expectedCardData);
  });

  it('Always returns zero values if a project filter is present', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Invitations',
      fileName: 'invitations',
      periodLabel: 'Yesterday',
      stats: [
        {
          label: 'Total',
          value: '-',
          lastPeriod: '-',
        },
        {
          label: 'Accepted',
          value: '-',
          lastPeriod: '-',
        },
      ],
    };

    const responseData = [
      [{ count: 4 }],
      [{ count: 3 }],
      [{ count: 2 }],
      [{ count: 1 }],
    ];

    const labels: InvitationsCardLabels = {
      invitations: 'Invitations',
      periodLabel: 'Yesterday',
      totalInvites: 'Total',
      pending: 'Pending',
      accepted: 'Accepted',
    };

    const data = invitationsConfig.dataParser(
      responseData,
      labels,
      'PROJECT_ID'
    );

    expect(data).toEqual(expectedCardData);
  });

  it('Creates the correct invitations query with default filters', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {},
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_invited.date': {
              from: '2022-10-01',
              to: '2022-10-31',
            },
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_user.invite_status': 'pending',
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_user.invite_status': 'accepted',
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_user.invite_status': 'accepted',
            'dimension_date_accepted.date': {
              from: '2022-10-01',
              to: '2022-10-31',
            },
          },
        },
      ],
    };

    const query = invitationsConfig.queryHandler({
      projectId: undefined,
      startAtMoment: null,
      endAtMoment: null,
      resolution: 'month',
    });

    expect(query).toEqual(expectedQuery);
  });

  it('Creates the correct invitations query when date & project filters applied', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_invited.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_date_invited.date': {
              from: '2022-10-24',
              to: '2022-10-31',
            },
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_user.invite_status': 'accepted',
            'dimension_date_accepted.date': {
              from: '2020-10-31',
              to: '2021-10-31',
            },
          },
        },
        {
          fact: 'registration',
          aggregations: {
            all: 'count',
          },
          filters: {
            'dimension_user.invite_status': 'accepted',
            'dimension_date_accepted.date': {
              from: '2022-10-24',
              to: '2022-10-31',
            },
          },
        },
      ],
    };

    const query = invitationsConfig.queryHandler({
      projectId: 'PROJECT_ID',
      startAtMoment: moment().set('year', 2020),
      endAtMoment: moment().set('year', 2021),
      resolution: 'week',
    });

    expect(query).toEqual(expectedQuery);
  });
});
