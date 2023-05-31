import { IUserData } from 'api/users/types';
import { addCommentVote } from 'api/comment_votes/useAddCommentVote';
import { deleteCommentVote } from 'api/comment_votes/useDeleteCommentVote';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import {
  trackUpvote,
  trackCancelUpvote,
} from 'components/PostShowComponents/Comments/Comment/CommentVote/trackVote';

export interface VoteOnCommentParams {
  alreadyVoted: boolean;
  commentId: string;
  commentType?: 'parent' | 'child';
  commentVoteId?: string;
}

export const voteOnComment =
  ({
    alreadyVoted,
    commentId,
    commentType,
    commentVoteId,
  }: VoteOnCommentParams) =>
  async (authUser: IUserData) => {
    if (!alreadyVoted) {
      await addCommentVote({
        commentId,
        userId: authUser.id,
        mode: 'up',
      });

      trackUpvote(commentType);
    }

    if (alreadyVoted && commentVoteId) {
      await deleteCommentVote({
        commentId,
        voteId: commentVoteId,
      });

      trackCancelUpvote(commentType);
    }

    streams.fetchAllWith({
      apiEndpoint: [`${API_PATH}/comments/${commentId}`],
    });
  };
