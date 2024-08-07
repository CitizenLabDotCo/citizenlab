import pollResponsesKeys from 'api/poll_responses/keys';
import { addPollResponse } from 'api/poll_responses/useAddPollResponse';
import projectsKeys from 'api/projects/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

export interface SubmitPollParams {
  phaseId: string;
  answers: string[];
  projectId: string;
}

export const submitPoll =
  ({ phaseId, answers, projectId }: SubmitPollParams) =>
  async () => {
    await addPollResponse({
      phaseId,
      optionIds: answers,
      projectId,
    });

    // Invalidate queries
    queryClient.invalidateQueries({
      queryKey: pollResponsesKeys.item({
        phaseId,
      }),
    });
    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: projectId }),
    });
  };
