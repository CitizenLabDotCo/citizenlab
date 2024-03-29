import { trackEventByName } from 'utils/analytics';

import tracks from '../../tracks';

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
