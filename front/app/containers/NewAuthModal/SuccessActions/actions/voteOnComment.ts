import { IUserData } from 'services/users';
import {
  upvote,
  removeVote,
} from 'components/PostShowComponents/Comments/Comment/CommentVote/vote';

export interface VoteOnCommentParams {
  alreadyVoted: boolean;
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType?: 'parent' | 'child';
  commentVoteId?: string;
}

export const voteOnComment =
  ({
    alreadyVoted,
    postId,
    postType,
    commentId,
    commentType,
    commentVoteId,
  }: VoteOnCommentParams) =>
  async (authUser: IUserData) => {
    if (!alreadyVoted) {
      await upvote({
        postId,
        postType,
        commentId,
        userId: authUser.id,
        commentType,
      });
    }

    if (alreadyVoted && commentVoteId) {
      await removeVote({
        commentId,
        commentVoteId,
        commentType,
      });
    }
  };
