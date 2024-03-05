import { addCommentReaction } from 'api/comment_reactions/useAddCommentReaction';
import { deleteCommentReaction } from 'api/comment_reactions/useDeleteCommentReaction';
import commentsKeys from 'api/comments/keys';
import { IUserData } from 'api/users/types';

import {
  trackLike,
  trackCancelLike,
} from 'components/PostShowComponents/Comments/Comment/CommentReaction/trackReaction';

import { queryClient } from 'utils/cl-react-query/queryClient';

export interface ReactionOnCommentParams {
  alreadyReacted: boolean;
  commentId: string;
  commentType?: 'parent' | 'child';
  commentReactionId?: string;
}

export const reactionOnComment =
  ({
    alreadyReacted,
    commentId,
    commentType,
    commentReactionId,
  }: ReactionOnCommentParams) =>
  async (authUser: IUserData) => {
    if (!alreadyReacted) {
      await addCommentReaction({
        commentId,
        userId: authUser.id,
        mode: 'up',
      });

      trackLike(commentType);
    }

    if (alreadyReacted && commentReactionId) {
      await deleteCommentReaction({
        commentId,
        reactionId: commentReactionId,
      });

      trackCancelLike(commentType);
    }
    queryClient.invalidateQueries({
      queryKey: commentsKeys.item({ id: commentId }),
    });
  };
