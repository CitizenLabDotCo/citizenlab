import React from 'react';
import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';
import { IAreaData } from 'api/areas/types';
import tracks from 'components/FollowUnfollow/tracks';
import { trackEventByName } from 'utils/analytics';
import { useLocation } from 'react-router-dom';

interface Props {
  area: IAreaData;
}

const UpdateFollowArea = ({ area }: Props) => {
  const { mutate: addFollower, isLoading: isAddingFollower } = useAddFollower();
  const { mutate: deleteFollower, isLoading: isDeletingFollower } =
    useDeleteFollower();
  const { pathname } = useLocation();
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
          isFollowing ? 'e2e-unfollow-area-button' : 'e2e-follow-area-button'
        }
      >
        <T value={area.attributes.title_multiloc} />
      </Button>
    </Badge>
  );
};

export default UpdateFollowArea;
