import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollQuestionsKeys from './keys';
import { IPollQuestion, IPollQuestionParameters } from './types';

type UpdatePollQuestion = {
  questionId: string;
  ordering: number;
} & IPollQuestionParameters;

const reorderPollQuestion = async ({
  questionId,
  participationContextId: _id,
  participationContextType: _type,
  ordering,
}: UpdatePollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions/${questionId}/reorder`,
    action: 'patch',
    body: { ordering },
  });

const useReorderPollQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollQuestion, { errors: CLErrors }, UpdatePollQuestion>({
    mutationFn: reorderPollQuestion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pollQuestionsKeys.list({
          participationContextId: variables.participationContextId,
          participationContextType: variables.participationContextType,
        }),
      });
    },
  });
};

export default useReorderPollQuestion;
