import React from 'react';
import { Button } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  followableType: 'project' | 'folder' | 'idea' | 'proposal';
  followableId: string; // id of the project, folder, idea or proposal
  followersCount?: number;
};

const FollowUnfollow = ({
  followableType,
  followableId,
  followersCount,
}: Props) => {
  const { formatMessage } = useIntl();
  const handleOnClick = () => {
    console.log('followableType', followableType);
    console.log('followableId', followableId);
  };
  const text = followableId ? messages.unFollow : messages.follow;
  const followText = followersCount
    ? `${formatMessage(text)} (${followersCount})`
    : formatMessage(text);

  return (
    <Button
      buttonStyle="primary-outlined"
      icon="notification"
      onClick={handleOnClick}
    >
      {followText}
    </Button>
  );
};

export default FollowUnfollow;
