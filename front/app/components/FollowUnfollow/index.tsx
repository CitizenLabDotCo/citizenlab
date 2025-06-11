import React from 'react';

import {
  Button,
  ButtonStyles,
  BoxWidthProps,
  BoxPaddingProps,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useABTest from 'api/experiments/useABTest';
import { FollowableType } from 'api/follow_unfollow/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

interface Props extends BoxWidthProps, BoxPaddingProps {
  followableType: FollowableType;
  followableId: string; // id of the project, folder, idea, proposal or anything to be followed
  followersCount?: number;
  followerId?: string; // id of the follower object
  iconSize?: string;
  followableSlug?: string;
  buttonStyle?: ButtonStyles;
  toolTipType?: 'input' | 'projectOrFolder';
}

const FollowUnfollow = ({
  followableType,
  followableId,
  followersCount,
  followerId,
  followableSlug,
  iconSize = '24px',
  buttonStyle = 'primary',
  toolTipType,
  ...otherButtonProps
}: Props) => {
  const isFollowingEnabled = useFeatureFlag({
    name: 'follow',
  });
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { pathname } = useLocation();
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { treatment, send } = useABTest({
    experiment: `Following an idea text(${locale})`,
    treatments: [
      formatMessage(messages.followADiscussion),
      formatMessage(messages.follow),
    ],
  });

  if (!isFollowingEnabled) return null;

  // If the follower id is present, then the user is following
  const followText =
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
      trackEventByName(tracks.unfollow, {
        followableType,
        id: followableId,
        urlPathName: pathname,
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
      trackEventByName(tracks.follow, {
        followableType,
        id: followableId,
        urlPathName: pathname,
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
      context,
      successAction,
    });
    trackEventByName(tracks.startLightUserRegThroughFollow, {
      followableType,
      id: followableId,
    });
  };

  const handleButtonClick = () => {
    if (authUser) {
      return followOrUnfollow();
    }
    loginAndFollow();
  };

  const getTooltipContent = () => {
    if (toolTipType === 'input') {
      return (
        <FormattedMessage
          {...messages.followTooltipInputPage}
          values={{
            unsubscribeLink: (
              <a
                href={'/profile/edit'}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'underline', color: colors.white }}
              >
                <FormattedMessage {...messages.unsubscribe} />
              </a>
            ),
          }}
        />
      );
    } else if (toolTipType === 'projectOrFolder') {
      return (
        <FormattedMessage
          {...messages.followTooltipProjects}
          values={{
            unsubscribeLink: (
              <a
                href={'/profile/edit'}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'underline', color: colors.white }}
              >
                <FormattedMessage {...messages.unsubscribe} />
              </a>
            ),
          }}
        />
      );
    }
    return null;
  };

  return (
    <Tooltip
      disabled={!toolTipType}
      theme="dark"
      maxWidth={280}
      placement="bottom"
      content={getTooltipContent()}
      useContentWrapper={false}
    >
      <Button
        buttonStyle={buttonStyle}
        icon="notification"
        onClick={handleButtonClick}
        iconSize={iconSize}
        px="12px"
        processing={isLoading}
        {...otherButtonProps}
        data-cy={isFollowing ? 'e2e-unfollow-button' : 'e2e-follow-button'}
      >
        {followersCount
          ? `${followUnfollowText} (${followersCount})`
          : followUnfollowText}
      </Button>
    </Tooltip>
  );
};

export default FollowUnfollow;
