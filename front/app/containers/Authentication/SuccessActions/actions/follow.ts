import { FollowableType } from 'api/follow_unfollow/types';
import { addFollower } from 'api/follow_unfollow/useAddFollower';
import { invalidateFollowQueries } from 'api/follow_unfollow/utils';

import tracks from 'components/FollowUnfollow/tracks';

import { trackEventByName } from 'utils/analytics';
import { queryClient } from 'utils/cl-react-query/queryClient';

export interface FollowActionParams {
  followableType: FollowableType;
  followableId: string;
}

export const follow =
  ({ followableType, followableId }: FollowActionParams) =>
  async () => {
    await addFollower({
      followableType,
      followableId,
    });
    trackEventByName(tracks.completeLightUserRegThroughFollow, {
      followableType,
      id: followableId,
    });

    invalidateFollowQueries(queryClient, followableType, followableId);
  };
