import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollQuestionsKeys from './keys';
import { IPollQuestion, IPollQuestionParameters } from './types';
import { capitalizeParticipationContextType } from 'utils/helperUtils';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

type AddPollQuestion = {
  title_multiloc: Multiloc;
} & IPollQuestionParameters;

const addPollQuestion = async ({
  participationContextId,
  participationContextType,
  title_multiloc,
}: AddPollQuestion) =>
  fetcher<IPollQuestion>({
    path: `/poll_questions`,
    action: 'post',
    body: {
      participation_context_id: participationContextId,
      participation_context_type: capitalizeParticipationContextType(
        participationContextType
      ),
      title_multiloc,
    },
  });

const useAddPollQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<IPollQuestion, { errors: CLErrors }, AddPollQuestion>({
    mutationFn: addPollQuestion,
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

export default useAddPollQuestion;
