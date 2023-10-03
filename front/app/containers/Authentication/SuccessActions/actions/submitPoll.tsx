import { addPollResponse } from 'api/poll_responses/useAddPollResponse';
import { IParticipationContextType } from 'typings';

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

    // Query invalidation
  };
