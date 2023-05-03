import { addInitiativeVote } from 'api/initiative_votes/useAddInitiativeVote';
import { queryClient } from 'utils/cl-react-query/queryClient';
import initiativesKeys from 'api/initiatives/keys';

export interface VoteOnInitiativeParams {
  initiativeId: string;
}

export const voteOnInitiative =
  ({ initiativeId }: VoteOnInitiativeParams) =>
  async () => {
    await addInitiativeVote({ initiativeId, mode: 'up' });
    queryClient.invalidateQueries({
      queryKey: initiativesKeys.item({ id: initiativeId }),
    });
  };
