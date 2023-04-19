import { IUserData } from 'services/users';
import { addIdeaVote } from 'api/idea_votes/useAddIdeaVote';
import { deleteIdeaVote } from 'api/idea_votes/useDeleteIdeaVote';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';

export interface VoteOnIdeaParams {
  ideaId: string;
  voteId?: string | null;
  voteMode: 'up' | 'down';
  myVoteMode?: 'up' | 'down' | null;
}

export const voteOnIdea =
  ({ ideaId, voteId, myVoteMode, voteMode }: VoteOnIdeaParams) =>
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

    queryClient.invalidateQueries({
      queryKey: ideasKeys.item({ id: ideaId }),
    });
  };
