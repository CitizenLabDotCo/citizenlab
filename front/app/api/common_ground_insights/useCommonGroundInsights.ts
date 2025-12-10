import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import {
  USE_DUMMY_COMMON_GROUND_INSIGHTS_DATA,
  dummyCommonGroundInsights,
  dummyCommonGroundInsightsWithGender,
  dummyCommonGroundInsightsWithAge,
  dummyCommonGroundInsightsWithDomicile,
} from './dummyData';
import commonGroundInsightsKeys from './keys';
import { CommonGroundResults, GroupByOption, SortOption } from './types';

/**
 * Fetches Common Ground results from the backend
 * Returns full JSONAPI response structure
 */
const fetchCommonGroundResults = ({
  phaseId,
  sort,
  groupBy,
}: {
  phaseId: string;
  sort?: SortOption;
  groupBy?: GroupByOption;
}) => {
  const params = new URLSearchParams();
  if (sort) params.append('sort', sort);
  if (groupBy) params.append('group_by', groupBy);

  const queryString = params.toString();
  const path = `/phases/${phaseId}/insights/common_ground${
    queryString ? `?${queryString}` : ''
  }` as `/${string}`;

  return fetcher<CommonGroundResults>({
    path,
    action: 'get',
  });
};

/**
 * Returns dummy data based on groupBy parameter
 */
const getDummyCommonGroundInsights = (
  groupBy?: GroupByOption
): CommonGroundResults => {
  if (groupBy === 'gender') return dummyCommonGroundInsightsWithGender;
  if (groupBy === 'birthyear') return dummyCommonGroundInsightsWithAge;
  if (groupBy === 'domicile') return dummyCommonGroundInsightsWithDomicile;
  return dummyCommonGroundInsights;
};

interface UseCommonGroundInsightsParams {
  phaseId: string;
  sort?: SortOption;
  groupBy?: GroupByOption;
  enabled?: boolean;
}

/**
 * Hook to fetch Common Ground insights
 * Returns standard React Query result with full JSONAPI structure
 * Access results via: data.data.attributes
 *
 * @param phaseId - Phase ID to fetch results for
 * @param sort - Sort option (most_agreed, most_disagreed, most_controversial, newest)
 * @param groupBy - Demographic grouping option (gender, birthyear, domicile)
 * @param enabled - Whether the query should run (defaults to true if phaseId exists)
 */
const useCommonGroundInsights = ({
  phaseId,
  sort,
  groupBy,
  enabled = true,
}: UseCommonGroundInsightsParams) => {
  return useQuery<CommonGroundResults, CLErrors, CommonGroundResults>({
    queryKey: commonGroundInsightsKeys.item({ phaseId, sort, groupBy }),
    queryFn: () =>
      USE_DUMMY_COMMON_GROUND_INSIGHTS_DATA
        ? getDummyCommonGroundInsights(groupBy)
        : fetchCommonGroundResults({ phaseId, sort, groupBy }),
    enabled: enabled && !!phaseId,
  });
};

export default useCommonGroundInsights;
