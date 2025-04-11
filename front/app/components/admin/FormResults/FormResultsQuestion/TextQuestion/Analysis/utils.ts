import { UseQueryResult } from '@tanstack/react-query';

import { IInputsFilterParams } from 'api/analysis_inputs/types';
import { IInsights } from 'api/analysis_insights/types';
import { ISummary } from 'api/analysis_summaries/types';

import {
  getQuarterFilter,
  getYearFilter,
} from 'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget/utils';

// Convert all values in the filters object to strings
// This is necessary because the filters are passed as query params
export const convertFilterValuesToString = (filters?: IInputsFilterParams) => {
  return (
    filters &&
    Object.entries(filters).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: JSON.stringify(value),
      };
    }, {})
  );
};

type FilterForQuarterArgs = {
  insights?: IInsights;
  search: URLSearchParams;
  analysisSummaries?: UseQueryResult<ISummary, unknown>[];
};

/**
 * Filters insights to only include those published within the selected quarter (from URL params).
 * Used by Community Monitor.
 */
export const filterForCommunityMonitorQuarter = ({
  analysisSummaries,
  insights,
  search,
}: FilterForQuarterArgs) => {
  const year = getYearFilter(search)
    ? parseInt(getYearFilter(search), 10)
    : null;
  const quarter = getQuarterFilter(search)
    ? parseInt(getQuarterFilter(search), 10)
    : null;

  if (!year || !quarter) {
    return { data: insights?.data ?? [] }; // If no valid filter, return all
  }

  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 0, 23, 59, 59, 999); // Inclusive to end of quarter

  const filteredInsights = insights?.data.filter((insight) => {
    const summary = analysisSummaries?.find(
      (summary) =>
        summary.data?.data.id === insight.relationships.insightable.data.id
    );

    const filters = summary?.data?.data.attributes.filters;
    const publishedFrom = filters?.published_at_from;
    const publishedTo = filters?.published_at_to;

    if (publishedFrom && publishedTo) {
      const fromDate = new Date(publishedFrom);

      // Return insights where "from" date falls within the quarter
      return fromDate >= quarterStart && fromDate <= quarterEnd;
    }

    // Keep any insights without date filters (e.g. admin-created summaries over multiple quarters)
    return true;
  });

  return {
    data: filteredInsights ?? [],
  };
};
