import React from 'react';
import { Button } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { FollowableType } from 'api/follow_unfollow/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';

type Props = {
  followableType: FollowableType;
  followableId: string; // id of the project, folder, idea or proposal
  followersCount?: number;
  isCurrentUserFollowing: boolean;
};

const FollowUnfollow = ({
  followableType,
  followableId,
  followersCount,
  isCurrentUserFollowing,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addFollower, isLoading } = useAddFollower();
  const handleOnClick = async () => {
    const response = await addFollower({
      followableType,
      followableId,
    });
    console.log('response', response);
  };
  const text = isCurrentUserFollowing ? messages.unFollow : messages.follow;
  const followText = followersCount
    ? `${formatMessage(text)} (${followersCount})`
    : formatMessage(text);

  return (
    <Button
      buttonStyle="primary-outlined"
      icon="notification"
      onClick={handleOnClick}
      processing={isLoading}
    >
      {followText}
    </Button>
  );
};

export default FollowUnfollow;
