import { UseQueryResult } from '@tanstack/react-query';

import { IInsightData } from 'api/analysis_insights/types';
import { ISummary } from 'api/analysis_summaries/types';

import {
  getQuarterFilter,
  getYearFilter,
} from 'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils';

import { filterForCommunityMonitorQuarter } from './utils';

// Mocks for getYearFilter and getQuarterFilter
jest.mock(
  'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils',
  () => {
    const actual = jest.requireActual(
      'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils'
    );
    return {
      ...actual,
      getYearFilter: jest.fn(),
      getQuarterFilter: jest.fn(),
    };
  }
);

describe('filterForCommunityMonitorQuarter', () => {
  const baseInsight = (id: string, insightableId: string): IInsightData => ({
    id,
    type: 'insight',
    relationships: {
      background_task: { data: { id: 'bt1', type: 'background_task' } },
      insightable: { data: { id: insightableId, type: 'summary' } },
    },
  });

  const makeSummary = (
    id: string,
    publishedFrom: string | null,
    publishedTo: string | null
  ): { data: ISummary } => ({
    data: {
      data: {
        id,
        type: 'summary',
        attributes: {
          filters: {
            published_at_from: publishedFrom || undefined,
            published_at_to: publishedTo || undefined,
            input_custom_field_no_empty_values: true,
          },
          summary: 'Here is a summary',
          accuracy: 0.8,
          created_at: '',
          updated_at: '',
          generated_at: '',
          missing_inputs_count: 0,
          custom_field_ids: { main_custom_field_id: 'cf1' },
        },
        relationships: {
          background_task: { data: { id: 'bt1', type: 'background_task' } },
        },
      },
    },
  });

  it('returns all insights when no year or quarter is selected', () => {
    (getYearFilter as jest.Mock).mockReturnValue(null);
    (getQuarterFilter as jest.Mock).mockReturnValue(null);

    const result = filterForCommunityMonitorQuarter({
      insights: {
        data: [baseInsight('i1', 's1')],
      },
      analysisSummaries: [],
      search: new URLSearchParams(),
    });

    expect(result.data).toHaveLength(1);
  });

  it('filters insights within the selected quarter', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2025');
    (getQuarterFilter as jest.Mock).mockReturnValue('2'); // Q2: Apr 1 – Jun 30

    const insights = {
      data: [
        baseInsight('i1', 's1'), // In Q2
        baseInsight('i2', 's2'), // In Q1
        baseInsight('i3', 's3'), // In Q3
      ],
    };

    const summaries = [
      makeSummary('s1', '2025-04-01', '2025-06-30'),
      makeSummary('s2', '2025-01-01', '2025-03-31'),
      makeSummary('s3', '2025-07-01', '2025-09-30'),
    ] as UseQueryResult<ISummary, unknown>[];

    const result = filterForCommunityMonitorQuarter({
      insights,
      analysisSummaries: summaries,
      search: new URLSearchParams(),
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('i1');
  });

  it('includes insights without filters (admin-created)', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2025');
    (getQuarterFilter as jest.Mock).mockReturnValue('2');

    const insights = {
      data: [baseInsight('i1', 's1')],
    };

    const summaries = [
      {
        data: {
          data: {
            id: 's1',
            type: 'summary',
            attributes: {
              summary: '',
              accuracy: 0.8,
              created_at: '',
              updated_at: '',
              generated_at: '',
              missing_inputs_count: 0,
              filters: undefined, // No filters
              custom_field_ids: { main_custom_field_id: 'cf1' },
            },
            relationships: {
              background_task: {
                data: { id: 'bt1', type: 'background_task' },
              },
            },
          },
        },
      },
    ];

    const result = filterForCommunityMonitorQuarter({
      insights,
      analysisSummaries: summaries as any,
      search: new URLSearchParams(),
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('i1');
  });

  it('excludes insights with published_from outside the selected quarter', () => {
    (getYearFilter as jest.Mock).mockReturnValue('2025');
    (getQuarterFilter as jest.Mock).mockReturnValue('2');

    const insights = {
      data: [baseInsight('i1', 's1')],
    };

    const summaries = [
      makeSummary('s1', '2025-10-01', '2025-12-31'), // Q4
    ] as UseQueryResult<ISummary, unknown>[];

    const result = filterForCommunityMonitorQuarter({
      insights,
      analysisSummaries: summaries,
      search: new URLSearchParams(),
    });

    expect(result.data).toHaveLength(0);
  });
});
