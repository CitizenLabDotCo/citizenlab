import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IPollQuestion,
  IPollQuestionAttributes,
  IPollQuestionParameters,
} from './types';
import invalidatePollQuestionsCache from './util/invalidatePollQuestionsCache';

type UpdatePollQuestion = {
  questionId: string;
} & Partial<IPollQuestionAttributes> &
  IPollQuestionParameters;

const updatePollQuestion = async ({
  questionId,
  phaseId: _id,
  ...rest
}: UpdatePollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions/${questionId}`,
    action: 'patch',
    body: { ...rest },
  });

const useUpdatePollQuestion = () => {
  return useMutation<IPollQuestion, { errors: CLErrors }, UpdatePollQuestion>({
    mutationFn: updatePollQuestion,
    onSuccess: (_data, variables) => {
      invalidatePollQuestionsCache(variables);
    },
  });
};

export default useUpdatePollQuestion;
