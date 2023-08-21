import React from 'react';
import {
  Button,
  BoxPaddingProps,
  ButtonStyles,
  BoxWidthProps,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { FollowableType } from 'api/follow_unfollow/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import useAuthUser from 'api/me/useAuthUser';

interface Props extends BoxPaddingProps, BoxWidthProps {
  followableType: FollowableType;
  followableId: string; // id of the project, folder, idea or proposal
  followersCount?: number;
  followerId?: string; // id of the follower object
  followableSlug?: string;
  buttonStyle?: ButtonStyles;
}

const FollowUnfollow = ({
  followableType,
  followableId,
  followersCount,
  followerId,
  followableSlug,
  buttonStyle = 'primary-outlined',
  ...otherButtonProps
}: Props) => {
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();

  if (!isFollowingEnabled) return null;

  // If the follower id is present, then the user is following
  const isFollowing = !!followerId;
  const followUnfollowText = isFollowing
    ? formatMessage(messages.unFollow)
    : formatMessage(messages.follow);
  const isLoading = isAddingFollower || isDeletingFollower;

  const followOrUnfollow = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId,
        followableType,
        followableSlug,
      });
    } else {
      addFollower({
        followableType,
        followableId,
        followableSlug,
      });
    }
  };

  const loginAndFollow = () => {
    const context = {
      type: 'follow',
      action: 'following',
    } as const;

    const successAction: SuccessAction = {
      name: 'follow',
      params: { followableType, followableId },
    };

    triggerAuthenticationFlow({
      flow: 'signup',
      context,
      successAction,
    });
  };

  const handleButtonClick = () => {
    if (authUser) {
      return followOrUnfollow();
    }
    loginAndFollow();
  };

  return (
    <Button
      buttonStyle={buttonStyle}
      icon="notification"
      onClick={handleButtonClick}
      processing={isLoading}
      {...otherButtonProps}
    >
      {followersCount
        ? `${followUnfollowText} (${followersCount})`
        : followUnfollowText}
    </Button>
  );
};

export default FollowUnfollow;
