import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import insightsKeys from '../analysis_insights/keys';

import { IQuestion } from './types';

type IQuestionRegenerate = {
  analysisId: string;
  questionId: string;
};

const regenerateAnalysisQuestion = async ({
  analysisId,
  questionId,
}: IQuestionRegenerate) =>
  fetcher<IQuestion>({
    path: `/analyses/${analysisId}/questions/${questionId}/regenerate`,
    action: 'post',
    body: null,
  });

const useRegenerateAnalysisQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<IQuestion, CLErrors, IQuestionRegenerate>({
    mutationFn: regenerateAnalysisQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useRegenerateAnalysisQuestion;
