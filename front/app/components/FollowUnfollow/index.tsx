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
import useABTest from 'api/experiments/useABTest';

interface Props extends BoxPaddingProps, BoxWidthProps {
  followableType: FollowableType;
  followableId: string; // id of the project, folder, idea, proposal or anything to be followed
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
  const { treatment, send } = useABTest({
    experiment: 'Following an idea text',
    treatments: [
      formatMessage(messages.followADiscussion),
      formatMessage(messages.follow),
    ],
  });

  if (!isFollowingEnabled) return null;

  // If the follower id is present, then the user is following
  let followText =
    followableType === 'ideas' ? treatment : formatMessage(messages.follow);
  const isFollowing = !!followerId;
  const followUnfollowText = isFollowing
    ? formatMessage(messages.unFollow)
    : followText;
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

      if (followableType === 'ideas') {
        send?.('Follow Button clicked');
      }
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
      data-cy={isFollowing ? 'e2e-unfollow-button' : 'e2e-follow-button'}
    >
      {followersCount
        ? `${followUnfollowText} (${followersCount})`
        : followUnfollowText}
    </Button>
  );
};

export default FollowUnfollow;
