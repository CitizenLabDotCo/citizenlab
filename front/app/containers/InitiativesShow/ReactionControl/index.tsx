import React from 'react';

// components
import FollowUnfollow from 'components/FollowUnfollow';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import BorderContainer from '../BorderContainer';
import StatusWrapper from './StatusWrapper';
import { IInitiative } from 'api/initiatives/types';

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
        buttonStyle="secondary"
      />
    </BorderContainer>
  );
};

export default ReactionControl;
