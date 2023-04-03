import { addInitiativeVote } from 'api/initiative_votes/useAddInitiativeVote';

interface Params {
  initiativeId: string;
}

export const voteOnInitiative =
  ({ initiativeId }: Params) =>
  async () => {
    addInitiativeVote({ initiativeId, mode: 'up' });
  };
