import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import insightsKeys from '../analysis_insights/keys';

import { ISummary, ISummaryAdd } from './types';

const addAnalysisSummary = async ({ analysisId, filters }: ISummaryAdd) =>
  fetcher<ISummary>({
    path: `/analyses/${analysisId}/summaries`,
    action: 'post',
    body: { summary: { filters } },
  });

const useAddAnalysisSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ISummary, CLErrors, ISummaryAdd>({
    mutationFn: addAnalysisSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightsKeys.all() });
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useAddAnalysisSummary;
