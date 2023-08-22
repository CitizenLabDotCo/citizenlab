import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import insightsKeys from '../analysis_insights/keys';
import { IQuestion, IQuestionAdd } from './types';

import backgroundTasksKeys from 'api/analysis_background_tasks/keys';

const addAnalysisQuestion = async ({
  analysisId,
  filters,
  question,
}: IQuestionAdd) =>
  fetcher<IQuestion>({
    path: `/analyses/${analysisId}/questions`,
    action: 'post',
    body: { question: { filters, question } },
  });

const useAddAnalysisQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<IQuestion, CLErrors, IQuestionAdd>({
    mutationFn: addAnalysisQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: backgroundTasksKeys.lists() });
    },
  });
};

export default useAddAnalysisQuestion;
