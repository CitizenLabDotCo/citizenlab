import moment from 'moment';

import { Query } from 'api/analytics/types';

import { StatCardData } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import { ProjectStatusCardLabels, projectStatusConfig } from './config';

describe('Project status card data parsing', () => {
  beforeAll(() => {
    // Set 'now' as a fixed date - 2022-10-31
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date('2022-10-31T00:00:00.000Z').getTime();
    });
  });

  it('Transforms data correctly into data format required by the project status stat card', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Project status',
      fileName: 'project_status',
      stats: [
        {
          label: 'Total',
          value: '5',
          toolTip: 'Total tool tip',
        },
        {
          label: 'Active',
          value: '4',
          toolTip: 'Active tool tip',
        },
        {
          label: 'Archived',
          value: '3',
        },
        {
          label: 'Finished',
          value: '2',
          toolTip: 'Finished tool tip',
        },
        {
          label: 'Draft',
          value: '1',
          display: 'corner',
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

    const labels: ProjectStatusCardLabels = {
      projects: 'Project status',
      periodLabel: 'Yesterday',
      totalProjects: 'Total',
      totalProjectsToolTip: 'Total tool tip',
      active: 'Active',
      activeToolTip: 'Active tool tip',
      archived: 'Archived',
      finished: 'Finished',
      finishedToolTip: 'Finished tool tip',
      draftProjects: 'Draft',
    };

    const data = projectStatusConfig.dataParser(
      responseData,
      labels,
      undefined
    );

    expect(data).toEqual(expectedCardData);
  });

  it('Only transforms archived and finished when only 2 values present in response data', () => {
    const expectedCardData: StatCardData = {
      cardTitle: 'Project status',
      fileName: 'project_status',
      stats: [
        {
          label: 'Archived',
          value: '2',
        },
        {
          label: 'Finished',
          value: '1',
          toolTip: 'Finished tool tip',
        },
      ],
    };

    const responseData = [[{ count: 2 }], [{ count: 1 }]];

    const labels: ProjectStatusCardLabels = {
      projects: 'Project status',
      periodLabel: '30 days',
      totalProjects: 'Total',
      totalProjectsToolTip: 'Total tool tip',
      active: 'Active',
      activeToolTip: 'Active tool tip',
      archived: 'Archived',
      finished: 'Finished',
      finishedToolTip: 'Finished tool tip',
      draftProjects: 'Draft',
    };

    const data = projectStatusConfig.dataParser(
      responseData,
      labels,
      undefined
    );

    expect(data).toEqual(expectedCardData);
  });

  it('Creates the correct invitations query with default filters', () => {
    const expectedQuery: Query = {
      query: [
        {
          fact: 'project_status',
          aggregations: {
            all: 'count',
          },
        },
        {
          fact: 'project_status',
          aggregations: {
            all: 'count',
          },
          filters: {
            status: 'published',
          },
        },
        {
          fact: 'project_status',
          aggregations: {
            all: 'count',
          },
          filters: {
            status: 'archived',
          },
        },
        {
          fact: 'project_status',
          aggregations: {
            all: 'count',
          },
          filters: {
            finished: true,
          },
        },
        {
          fact: 'project_status',
          aggregations: {
            all: 'count',
          },
          filters: {
            finished: false,
            status: 'draft',
          },
        },
      ],
    };

    const query = projectStatusConfig.queryHandler({
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
          fact: 'project_status',
          aggregations: { all: 'count' },
          filters: {
            status: 'archived',
            'dimension_date.date': { from: '2020-10-31', to: '2021-10-31' },
            'dimension_project.id': 'PROJECT_ID',
          },
        },
        {
          fact: 'project_status',
          aggregations: { all: 'count' },
          filters: {
            finished: true,
            'dimension_date.date': { from: '2020-10-31', to: '2021-10-31' },
            'dimension_project.id': 'PROJECT_ID',
          },
        },
      ],
    };

    const query = projectStatusConfig.queryHandler({
      projectId: 'PROJECT_ID',
      startAtMoment: moment().set('year', 2020),
      endAtMoment: moment().set('year', 2021),
      resolution: 'week',
    });

    expect(query).toEqual(expectedQuery);
  });
});
