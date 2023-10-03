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
}

export const submitPoll =
  ({ id, type, answers, projectId }: SubmitPollParams) =>
  async () => {
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
    if (type === 'project') {
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id }),
      });
    }
  };
