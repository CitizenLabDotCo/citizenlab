import { useMutation } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IPollQuestionParameters } from './types';
import invalidatePollQuestionsCache from './util/invalidatePollQuestionsCache';

const deleteQuestion = async ({
  questionId,
  participationContextId: _id,
  participationContextType: _type,
}: IPollQuestionParameters & { questionId: string }) =>
  fetcher({
    path: `/poll_questions/${questionId}`,
    action: 'delete',
  });

const useDeletePollQuestion = () => {
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_data, variables) => {
      invalidatePollQuestionsCache(variables);
    },
  });
};

export default useDeletePollQuestion;
