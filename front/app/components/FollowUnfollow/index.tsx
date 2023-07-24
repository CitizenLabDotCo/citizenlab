import React from 'react';
import {
  Button,
  BoxPaddingProps,
  ButtonStyles,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { FollowableType } from 'api/follow_unfollow/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';

interface Props extends BoxPaddingProps {
  followableType: FollowableType;
  followableId: string; // id of the project, folder, idea or proposal
  followersCount?: number;
  followerId?: string; // id of the follower object
  buttonStyle?: ButtonStyles;
}

const FollowUnfollow = ({
  followableType,
  followableId,
  followersCount,
  followerId,
  buttonStyle = 'primary-outlined',
  ...paddingProps
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();

  // If the follower id is present, then the user is following
  const isFollowing = !!followerId;
  const followUnfollowText = isFollowing
    ? formatMessage(messages.unFollow)
    : formatMessage(messages.follow);
  const isLoading = isAddingFollower || isDeletingFollower;

  const handleOnClick = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId,
        followableType,
      });
    } else {
      addFollower({
        followableType,
        followableId,
      });
    }
  };

  return (
    <Button
      buttonStyle={buttonStyle}
      icon="notification"
      onClick={handleOnClick}
      processing={isLoading}
      {...paddingProps}
    >
      {followersCount
        ? `${followUnfollowText} (${followersCount})`
        : followUnfollowText}
    </Button>
  );
};

export default FollowUnfollow;
