import { IUserData } from 'services/users';
import {
  upvote,
  removeVote,
} from 'components/PostShowComponents/Comments/Comment/CommentVote/vote';

interface Params {
  alreadyVoted: boolean;
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType?: 'parent' | 'child';
  commentVoteId: string;
}

export const voteOnComment =
  ({
    alreadyVoted,
    postId,
    postType,
    commentId,
    commentType,
    commentVoteId,
  }: Params) =>
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

    if (alreadyVoted) {
      await removeVote({
        commentId,
        commentVoteId,
        commentType,
      });
    }
  };
