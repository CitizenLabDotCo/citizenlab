import React, { useEffect, useState } from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { IAreaData } from 'api/areas/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';

import useLocalize from 'hooks/useLocalize';

import tracks from 'components/FollowUnfollow/tracks';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  area: IAreaData;
  children: React.ReactNode;
  hideButtonIcon?: boolean;
}

const BaseUpdateFollowArea = ({
  area,
  children,
  hideButtonIcon = false,
}: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { pathname } = useLocation();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const isLoading = isAddingFollower || isDeletingFollower;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const followerId = area.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const areaButtonContentColor = isFollowing
    ? colors.white
    : theme.colors.tenantPrimary;
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
  const localizedAreaTitle = localize(area.attributes.title_multiloc);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const messageToAnnounce = isFollowing
    ? formatMessage(messages.followedArea, {
        areaTitle: localizedAreaTitle,
      })
    : formatMessage(messages.unfollowedArea, {
        areaTitle: localizedAreaTitle,
      });

  useEffect(() => {
    if (!isLoading) {
      setScreenReaderAnnouncement(messageToAnnounce);
    }
  }, [isLoading, messageToAnnounce]);

  const handleFollowOrUnfollow = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId: area.id,
        followableType: 'areas',
      });
      trackEventByName(tracks.unfollow, {
        followableType: 'areas',
        id: area.id,
        urlPathName: pathname,
      });
    } else {
      addFollower({
        followableType: 'areas',
        followableId: area.id,
      });
      trackEventByName(tracks.follow, {
        followableType: 'areas',
        id: area.id,
        urlPathName: pathname,
      });
    }
  };

  return (
    <Badge
      color={theme.colors.tenantPrimary}
      className={isFollowing ? 'inverse' : ''}
      onClick={handleFollowOrUnfollow}
    >
      <Button
        buttonStyle="text"
        icon={hideButtonIcon ? undefined : iconName}
        iconColor={areaButtonContentColor}
        iconPos="right"
        padding="0px"
        my="0px"
        processing={isLoading}
        textColor={areaButtonContentColor}
        ariaPressed={!isLoading ? isFollowing : undefined}
        data-cy={
          isFollowing ? 'e2e-unfollow-area-button' : 'e2e-follow-area-button'
        }
      >
        {children}
      </Button>
      <ScreenReaderOnly aria-live="polite">
        {screenReaderAnnouncement}
      </ScreenReaderOnly>
    </Badge>
  );
};

export default BaseUpdateFollowArea;
