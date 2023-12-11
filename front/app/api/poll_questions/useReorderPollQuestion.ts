import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IPollQuestion, IPollQuestionParameters } from './types';
import invalidatePollQuestionsCache from './util/invalidatePollQuestionsCache';

type UpdatePollQuestion = {
  questionId: string;
  ordering: number;
} & IPollQuestionParameters;

const reorderPollQuestion = async ({
  questionId,
  phaseId: _id,
  ordering,
}: UpdatePollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions/${questionId}/reorder`,
    action: 'patch',
    body: { ordering },
  });

const useReorderPollQuestion = () => {
  return useMutation<IPollQuestion, { errors: CLErrors }, UpdatePollQuestion>({
    mutationFn: reorderPollQuestion,
    onSuccess: (_data, variables) => {
      invalidatePollQuestionsCache(variables);
    },
  });
};

export default useReorderPollQuestion;
