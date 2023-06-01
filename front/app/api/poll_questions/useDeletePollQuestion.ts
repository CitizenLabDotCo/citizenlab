import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import questionKeys from './keys';
import { IPollQuestionParameters } from './types';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: questionKeys.list({
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

export default useDeletePollQuestion;
