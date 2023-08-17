import React from 'react';
import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { ITopicData } from 'api/topics/types';

interface Props {
  topic: ITopicData;
}

const Topic = ({ topic }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const isLoading = isAddingFollower || isDeletingFollower;
  const followerId = topic.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const color = isFollowing ? colors.success : colors.coolGrey300;
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
  const handleFollowOrUnfollow = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId: topic.id,
        followableType: 'topics',
      });
    } else {
      addFollower({
        followableType: 'topics',
        followableId: topic.id,
      });
    }
  };

  return (
    <Badge color={color} onClick={handleFollowOrUnfollow}>
      <Button
        buttonStyle="text"
        icon={iconName}
        iconColor={color}
        iconPos="right"
        padding="0px"
        my="0px"
        processing={isLoading}
        data-cy={
          isFollowing ? 'e2e-unfollow-topic-button' : 'e2e-follow-topic-button'
        }
      >
        <T value={topic.attributes.title_multiloc} />
      </Button>
    </Badge>
  );
};

export default Topic;
