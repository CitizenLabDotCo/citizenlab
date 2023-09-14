import { queryClient } from 'utils/cl-react-query/queryClient';
import { FollowableType } from 'api/follow_unfollow/types';
import { addFollower } from 'api/follow_unfollow/useAddFollower';
import { invalidateFollowQueries } from 'api/follow_unfollow/utils';

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

    invalidateFollowQueries(queryClient, followableType, followableId);
  };
