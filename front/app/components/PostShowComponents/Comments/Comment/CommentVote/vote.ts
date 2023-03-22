import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

interface UpvoteParams {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  userId: string;
  commentType: 'parent' | 'child' | undefined;
}

export async function upvote({
  postId,
  postType,
  commentId,
  userId,
  commentType,
}: UpvoteParams) {
  await addCommentVote(postId, postType, commentId, {
    user_id: userId,
    mode: 'up',
  });

  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentUpvoteButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentUpvoteButton);
  } else {
    trackEventByName(tracks.clickCommentUpvoteButton);
  }
}

interface DeleteParams {
  commentId: string;
  commentVoteId: string;
  commentType: 'parent' | 'child' | undefined;
}

export async function removeVote({
  commentId,
  commentVoteId,
  commentType,
}: DeleteParams) {
  await deleteCommentVote(commentId, commentVoteId);

  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentCancelUpvoteButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentCancelUpvoteButton);
  } else {
    trackEventByName(tracks.clickCommentCancelUpvoteButton);
  }
}
