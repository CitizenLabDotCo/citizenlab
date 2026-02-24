import React, { useEffect, useState } from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'utils/router';
import { useTheme } from 'styled-components';

import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { IGlobalTopicData } from 'api/global_topics/types';

import useLocalize from 'hooks/useLocalize';

import tracks from 'components/FollowUnfollow/tracks';
import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  topic: IGlobalTopicData;
}

const UpdateFollowTopic = ({ topic }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { pathname } = useLocation();
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isLoading = isAddingFollower || isDeletingFollower;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const followerId = topic.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const topicButtonContentColor = isFollowing
    ? colors.white
    : theme.colors.tenantPrimary;
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
  const localizedTopicTitle = localize(topic.attributes.title_multiloc);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const messageToAnnounce = isFollowing
    ? formatMessage(messages.followedTopic, {
        topicTitle: localizedTopicTitle,
      })
    : formatMessage(messages.unfollowedTopic, {
        topicTitle: localizedTopicTitle,
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
        followableId: topic.id,
        followableType: 'global_topics',
      });
      trackEventByName(tracks.unfollow, {
        followableType: 'global_topics',
        id: topic.id,
        urlPathName: pathname,
      });
    } else {
      addFollower({
        followableType: 'global_topics',
        followableId: topic.id,
      });
      trackEventByName(tracks.follow, {
        followableType: 'global_topics',
        id: topic.id,
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
        icon={iconName}
        iconColor={topicButtonContentColor}
        iconPos="right"
        padding="0px"
        my="0px"
        processing={isLoading}
        textColor={topicButtonContentColor}
        ariaPressed={!isLoading ? isFollowing : undefined}
        data-cy={
          isFollowing ? 'e2e-unfollow-topic-button' : 'e2e-follow-topic-button'
        }
      >
        <T value={topic.attributes.title_multiloc} />
      </Button>
      <ScreenReaderOnly aria-live="polite">
        {screenReaderAnnouncement}
      </ScreenReaderOnly>
    </Badge>
  );
};

export default UpdateFollowTopic;
