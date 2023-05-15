import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

export const trackUpvote = (commentType: 'parent' | 'child' | undefined) => {
  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentUpvoteButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentUpvoteButton);
  } else {
    trackEventByName(tracks.clickCommentUpvoteButton);
  }
};

export const trackCancelUpvote = (
  commentType: 'parent' | 'child' | undefined
) => {
  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentCancelUpvoteButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentCancelUpvoteButton);
  } else {
    trackEventByName(tracks.clickCommentCancelUpvoteButton);
  }
};
