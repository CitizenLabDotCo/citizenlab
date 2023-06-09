import { IUserData } from 'api/users/types';
import { addCommentReaction } from 'api/comment_reactions/useAddCommentReaction';
import { deleteCommentReaction } from 'api/comment_reactions/useDeleteCommentReaction';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import {
  trackLike,
  trackCancelLike,
} from 'components/PostShowComponents/Comments/Comment/CommentReaction/trackReaction';

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

    streams.fetchAllWith({
      apiEndpoint: [`${API_PATH}/comments/${commentId}`],
    });
  };
