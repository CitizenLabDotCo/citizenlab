import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

export const trackLike = (commentType: 'parent' | 'child' | undefined) => {
  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentLikeButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentLikeButton);
  } else {
    trackEventByName(tracks.clickCommentLikeButton);
  }
};

export const trackCancelLike = (
  commentType: 'parent' | 'child' | undefined
) => {
  if (commentType === 'parent') {
    trackEventByName(tracks.clickParentCommentCancelLikeButton);
  } else if (commentType === 'child') {
    trackEventByName(tracks.clickChildCommentCancelLikeButton);
  } else {
    trackEventByName(tracks.clickCommentCancelLikeButton);
  }
};
