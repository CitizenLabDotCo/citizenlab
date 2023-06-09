import { IUserData } from 'api/users/types';
import { addIdeaReaction } from 'api/idea_reactions/useAddIdeaReaction';
import { deleteIdeaReaction } from 'api/idea_reactions/useDeleteIdeaReaction';
import { queryClient } from 'utils/cl-react-query/queryClient';
import ideasKeys from 'api/ideas/keys';

export interface ReactionOnIdeaParams {
  ideaId: string;
  reactionId?: string | null;
  reactionMode: 'up' | 'down';
  myReactionMode?: 'up' | 'down' | null;
}

export const reactionOnIdea =
  ({
    ideaId,
    reactionId,
    myReactionMode,
    reactionMode,
  }: ReactionOnIdeaParams) =>
  async (authUser: IUserData) => {
    // Change reaction (up -> down or down -> up)
    if (reactionId && myReactionMode !== reactionMode) {
      await deleteIdeaReaction({ ideaId, reactionId });
      await addIdeaReaction({
        ideaId,
        userId: authUser.id,
        mode: reactionMode,
      });
    }

    // Cancel reaction
    if (reactionId && myReactionMode === reactionMode) {
      await deleteIdeaReaction({ ideaId, reactionId });
    }

    // Add reaction
    if (!reactionId) {
      await addIdeaReaction({
        ideaId,
        userId: authUser.id,
        mode: reactionMode,
      });
    }

    queryClient.invalidateQueries({
      queryKey: ideasKeys.item({ id: ideaId }),
    });
  };
