import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { ICommentsSummary, ICommentsSummaryGenerate } from './types';

const generateAnalysisCommentsSummary = async ({
  analysisId,
  inputId,
}: ICommentsSummaryGenerate) =>
  fetcher<ICommentsSummary>({
    path: `/analyses/${analysisId}/inputs/${inputId}/comments_summary`,
    action: 'post',
    body: null,
  });

const useGenerateAnalysisCommentsSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ICommentsSummary, CLErrors, ICommentsSummaryGenerate>({
    mutationFn: generateAnalysisCommentsSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useGenerateAnalysisCommentsSummary;
