import { UseQueryOptions, useQueries } from '@tanstack/react-query';
import { IInsights } from './types';
import insightsKeys from './keys';
import { fetchInsights } from './useAnalysisInsights';

type AnalysisInsightsWithIdsReturnType = UseQueryOptions<IInsights>[];

const useAnalysisInsightsWithIds = ({
  analysisIds,
}: {
  analysisIds: string[];
}) => {
  const queries = analysisIds
    ? analysisIds.map((analysisIds) => ({
        queryKey: insightsKeys.list({
          analysisId: analysisIds,
        }),
        queryFn: () => fetchInsights({ analysisId: analysisIds }),
      }))
    : [];
  return useQueries<AnalysisInsightsWithIdsReturnType>({
    queries,
  });
};

export default useAnalysisInsightsWithIds;
