import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollQuestionsKeys from './keys';
import {
  IPollQuestion,
  IPollQuestionAttributes,
  IPollQuestionParameters,
} from './types';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

type UpdatePollQuestion = {
  questionId: string;
} & Partial<IPollQuestionAttributes> &
  IPollQuestionParameters;

const updatePollQuestion = async ({
  questionId,
  participationContextId: _id,
  participationContextType: _type,
  ...rest
}: UpdatePollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions/${questionId}`,
    action: 'patch',
    body: { ...rest },
  });

const useUpdatePollQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollQuestion, { errors: CLErrors }, UpdatePollQuestion>({
    mutationFn: updatePollQuestion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pollQuestionsKeys.list({
          participationContextId: variables.participationContextId,
          participationContextType: variables.participationContextType,
        }),
      });

      if (variables.participationContextType === 'project') {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: variables.participationContextId }),
        });
      } else if (variables.participationContextType === 'phase') {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({
            phaseId: variables.participationContextId,
          }),
        });
      }
    },
  });
};

export default useUpdatePollQuestion;
