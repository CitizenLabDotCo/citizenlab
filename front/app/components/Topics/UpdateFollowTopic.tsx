import React, { useEffect, useState } from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import tracks from 'components/FollowUnfollow/tracks';
import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  topic: ITopicData;
}

const UpdateFollowTopic = ({ topic }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { pathname } = useLocation();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isLoading = isAddingFollower || isDeletingFollower;
  const followerId = topic.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const color = isFollowing ? colors.success : colors.coolGrey300;
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
  const localizedTopicTitle = localize(topic.attributes.title_multiloc);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!isLoading) {
      const message = isFollowing
        ? formatMessage(messages.followedTopic, {
            topicTitle: localizedTopicTitle,
          })
        : formatMessage(messages.unfollowedTopic, {
            topicTitle: localizedTopicTitle,
          });
      setAnnouncement(message);
    }
  }, [isLoading, isFollowing, formatMessage, localizedTopicTitle]);

  const handleFollowOrUnfollow = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId: topic.id,
        followableType: 'topics',
      });
      trackEventByName(tracks.unfollow, {
        followableType: 'topics',
        id: topic.id,
        urlPathName: pathname,
      });
    } else {
      addFollower({
        followableType: 'topics',
        followableId: topic.id,
      });
      trackEventByName(tracks.follow, {
        followableType: 'topics',
        id: topic.id,
        urlPathName: pathname,
      });
    }
  };

  return (
    <Badge color={color} onClick={handleFollowOrUnfollow} aria-busy={isLoading}>
      <Button
        buttonStyle="text"
        icon={iconName}
        iconColor={color}
        iconPos="right"
        padding="0px"
        my="0px"
        processing={isLoading}
        ariaPressed={!isLoading ? isFollowing : undefined}
        data-cy={
          isFollowing ? 'e2e-unfollow-topic-button' : 'e2e-follow-topic-button'
        }
      >
        <T value={topic.attributes.title_multiloc} />
      </Button>
      <ScreenReaderOnly aria-live="polite">{announcement}</ScreenReaderOnly>
    </Badge>
  );
};

export default UpdateFollowTopic;
