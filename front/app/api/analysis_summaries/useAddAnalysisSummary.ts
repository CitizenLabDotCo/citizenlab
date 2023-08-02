import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import summariesKeys from './keys';
import { ISummary, ISummaryAdd } from './types';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

const addAnalysisSummary = async ({ analysisId, filters }: ISummaryAdd) =>
  fetcher<ISummary>({
    path: `/analyses/${analysisId}/summaries`,
    action: 'post',
    body: { filters },
  });

const useAddAnalysisSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ISummary, CLErrors, ISummaryAdd>({
    mutationFn: addAnalysisSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: summariesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useAddAnalysisSummary;
