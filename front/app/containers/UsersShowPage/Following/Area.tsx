import React from 'react';
import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { IAreaData } from 'api/areas/types';

interface Props {
  area: IAreaData;
}

const Area = ({ area }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const isLoading = isAddingFollower || isDeletingFollower;
  const followerId = area.relationships.user_follower?.data?.id;
  const isFollowing = !!followerId;
  const color = isFollowing ? colors.success : colors.coolGrey300;
  const iconName = isFollowing ? 'check-circle' : 'plus-circle';
  const handleFollowOrUnfollow = () => {
    if (isFollowing) {
      deleteFollower({
        followerId,
        followableId: area.id,
        followableType: 'areas',
      });
    } else {
      addFollower({
        followableType: 'areas',
        followableId: area.id,
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
      >
        <T value={area.attributes.title_multiloc} />
      </Button>
    </Badge>
  );
};

export default Area;
