import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import insightsKeys from '../analysis_insights/keys';

import { ISummary } from './types';

type ISummaryRegenerate = {
  analysisId: string;
  summaryId: string;
};

const regenerateAnalysisSummary = async ({
  analysisId,
  summaryId,
}: ISummaryRegenerate) =>
  fetcher<ISummary>({
    path: `/analyses/${analysisId}/summaries/${summaryId}/regenerate`,
    action: 'post',
    body: null,
  });

const useRegenerateAnalysisSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ISummary, CLErrors, ISummaryRegenerate>({
    mutationFn: regenerateAnalysisSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useRegenerateAnalysisSummary;
