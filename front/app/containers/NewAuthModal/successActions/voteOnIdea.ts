import { IUserData } from 'services/users';
import { addIdeaVote } from 'api/idea_votes/useAddIdeaVote';
import { deleteIdeaVote } from 'api/idea_votes/useDeleteIdeaVote';

interface Params {
  ideaId: string;
  voteId?: string | null;
  voteMode: 'up' | 'down';
  myVoteMode: 'up' | 'down';
}

export const voteOnIdea =
  ({ ideaId, voteId, myVoteMode, voteMode }: Params) =>
  async (authUser: IUserData) => {
    // Change vote (up -> down or down -> up)
    if (voteId && myVoteMode !== voteMode) {
      await deleteIdeaVote({ ideaId, voteId });
      await addIdeaVote({
        ideaId,
        userId: authUser.id,
        mode: voteMode,
      });
    }

    // Cancel vote
    if (voteId && myVoteMode === voteMode) {
      await deleteIdeaVote({ ideaId, voteId });
    }

    // Add vote
    if (!voteId) {
      await addIdeaVote({
        ideaId,
        userId: authUser.id,
        mode: voteMode,
      });
    }
  };
