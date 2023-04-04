import { addInitiativeVote } from 'api/initiative_votes/useAddInitiativeVote';

export interface VoteOnInitiativeParams {
  initiativeId: string;
}

export const voteOnInitiative =
  ({ initiativeId }: VoteOnInitiativeParams) =>
  async () => {
    addInitiativeVote({ initiativeId, mode: 'up' });
  };
