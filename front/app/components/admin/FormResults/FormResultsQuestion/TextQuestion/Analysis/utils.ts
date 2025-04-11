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

/* For Community Monitor, we only want to show insights for the selected quarter (URL params)
 *
 * Description: We want to filter the insights using the published_at_from and published_at_from filters
 * on the insight summaries.
 */
export const filterForCommunityMonitorQuarter = ({
  analysisSummaries,
  insights,
  search,
}: FilterForQuarterArgs) => {
  // Get the year/quarter from URL
  const yearFilter = getYearFilter(search);
  const quarterFilter = getQuarterFilter(search);

  // Parse quarter and year filters
  const quarter = quarterFilter ? parseInt(quarterFilter, 10) : null;
  const year = yearFilter ? parseInt(yearFilter, 10) : null;

  // Filter insights to only select those insights with a summary created for the selected quarter
  const quarterInsights = insights?.data.filter((insight) => {
    // Find the associated summary for the insight
    const summary = analysisSummaries?.find(
      (summary) =>
        summary.data?.data.id === insight.relationships.insightable.data.id
    );

    // Get any date filters for the summary
    const filters = summary?.data?.data.attributes.filters;
    const publishedAtFrom = filters?.published_at_from;
    const publishedAtTo = filters?.published_at_to;

    if (year && quarter && publishedAtFrom && publishedAtTo) {
      // Define quarter start and end dates
      const quarterStart = new Date(year, (quarter - 1) * 3, 1);
      const quarterEnd = new Date(year, quarter * 3, 0);

      // Convert published date to actual Date object
      const publishedAtFromDate = new Date(publishedAtFrom);

      // Check if published within the quarter
      const isWithinQuarter =
        publishedAtFromDate >= quarterStart &&
        publishedAtFromDate <= quarterEnd;

      return isWithinQuarter;
    }

    return true; // If there are summaries an admin created scross all quarters, show those still.
  });

  return {
    data: quarterInsights ?? [],
  };
};
