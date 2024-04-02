import { addInitiativeReaction } from 'api/initiative_reactions/useAddInitiativeReaction';
import initiativesKeys from 'api/initiatives/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

export interface ReactionOnInitiativeParams {
  initiativeId: string;
}

export const reactionOnInitiative =
  ({ initiativeId }: ReactionOnInitiativeParams) =>
  async () => {
    await addInitiativeReaction({ initiativeId, mode: 'up' });
    queryClient.invalidateQueries({
      queryKey: initiativesKeys.item({ id: initiativeId }),
    });
  };
