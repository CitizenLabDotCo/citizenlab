import React from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import { IAreaData } from 'api/areas/types';
import useAddFollower from 'api/follow_unfollow/useAddFollower';
import useDeleteFollower from 'api/follow_unfollow/useDeleteFollower';

import tracks from 'components/FollowUnfollow/tracks';
import T from 'components/T';

import { trackEventByName } from 'utils/analytics';

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
  const buttonTextColor = isFollowing ? colors.white : colors.success;
  const className = isFollowing ? 'inverse' : '';
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
          isFollowing ? 'e2e-unfollow-area-button' : 'e2e-follow-area-button'
        }
      >
        <T value={area.attributes.title_multiloc} />
      </Button>
    </Badge>
  );
};

export default UpdateFollowArea;
