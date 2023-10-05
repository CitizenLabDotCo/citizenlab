import { addPollResponse } from 'api/poll_responses/useAddPollResponse';
import { IParticipationContextType } from 'typings';
import { queryClient } from 'utils/cl-react-query/queryClient';
import pollResponsesKeys from 'api/poll_responses/keys';
import projectsKeys from 'api/projects/keys';

export interface SubmitPollParams {
  id: string;
  type: IParticipationContextType;
  answers: string[];
  projectId: string;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export const submitPoll =
  ({ id, type, answers, projectId, setIsSubmitting }: SubmitPollParams) =>
  async () => {
    setIsSubmitting(true);
    await addPollResponse({
      participationContextId: id,
      participationContextType: type,
      optionIds: answers,
      projectId,
    });

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: pollResponsesKeys.item({
        participationContextId: id,
        participationContextType: type,
      }),
    });
    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: projectId }),
    });
    setIsSubmitting(false);
  };
