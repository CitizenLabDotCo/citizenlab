import React from 'react';

import { IInitiative } from 'api/initiatives/types';

import FollowUnfollow from 'components/FollowUnfollow';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import BorderContainer from '../BorderContainer';

import messages from './messages';
import StatusWrapper from './StatusWrapper';

interface Props {
  initiative: IInitiative;
  onScrollToOfficialFeedback: () => void;
  id?: string;
}

const ReactionControl = ({
  initiative,
  onScrollToOfficialFeedback,
  id,
}: Props) => {
  return (
    <BorderContainer id={id}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
      </ScreenReaderOnly>
      <StatusWrapper
        initiative={initiative}
        onScrollToOfficialFeedback={onScrollToOfficialFeedback}
      />
      <FollowUnfollow
        followableType="initiatives"
        followableId={initiative.data.id}
        followersCount={initiative.data.attributes.followers_count}
        followerId={initiative.data.relationships.user_follower?.data?.id}
        buttonStyle="primary-outlined"
        toolTipType="input"
      />
    </BorderContainer>
  );
};

export default ReactionControl;
