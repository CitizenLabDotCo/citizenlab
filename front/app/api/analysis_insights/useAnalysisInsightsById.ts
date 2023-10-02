import { UseQueryOptions, useQueries } from '@tanstack/react-query';
import { IInsights } from './types';
import insightsKeys from './keys';
import { fetchInsights } from './useAnalysisInsights';

type AnalysisInsightsWithIdsReturnType = UseQueryOptions<IInsights>[];

const useAnalysisInsightsWithIds = ({
  analysisIds,
  bookmarked,
}: {
  analysisIds: string[];
  bookmarked?: boolean;
}) => {
  const queries = analysisIds
    ? analysisIds.map((analysisIds) => ({
        queryKey: insightsKeys.list({
          analysisId: analysisIds,
          bookmarked,
        }),
        queryFn: () => fetchInsights({ analysisId: analysisIds, bookmarked }),
      }))
    : [];
  return useQueries<AnalysisInsightsWithIdsReturnType>({
    queries,
  });
};

export default useAnalysisInsightsWithIds;
