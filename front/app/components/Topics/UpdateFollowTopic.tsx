import React from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { ITopicData } from 'api/topics/types';

import tracks from 'components/FollowUnfollow/tracks';
import T from 'components/T';

import { trackEventByName } from 'utils/analytics';

interface Props {
  topic: ITopicData;
}

const UpdateFollowTopic = ({ topic }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { pathname } = useLocation();
  const isLoading = isAddingFollower || isDeletingFollower;
  const followerId = topic.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const buttonTextColor = isFollowing ? colors.white : colors.success;
  const className = isFollowing ? 'inverse' : '';
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
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
    <Badge
      color={colors.success}
      className={className}
      onClick={handleFollowOrUnfollow}
    >
      <Button
        buttonStyle="text"
        icon={iconName}
        iconColor={buttonTextColor}
        iconPos="right"
        padding="0px"
        my="0px"
        processing={isLoading}
        textColor={buttonTextColor}
        data-cy={
          isFollowing ? 'e2e-unfollow-topic-button' : 'e2e-follow-topic-button'
        }
      >
        <T value={topic.attributes.title_multiloc} />
      </Button>
    </Badge>
  );
};

export default UpdateFollowTopic;
