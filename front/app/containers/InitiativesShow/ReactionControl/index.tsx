import React from 'react';

// components
import FollowUnfollow from 'components/FollowUnfollow';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import BorderContainer from '../BorderContainer';
import Status from './Status';

interface Props {
  initiativeId: string;
  className?: string;
  onScrollToOfficialFeedback: () => void;
  id?: string;
}

const ReactionControl = ({
  onScrollToOfficialFeedback,
  initiativeId,
  id,
}: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);

  if (!initiative) {
    return null;
  }

  return (
    <BorderContainer id={id}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
      </ScreenReaderOnly>
      <Box mb="8px">
        <Status
          initiativeId={initiative.data.id}
          onScrollToOfficialFeedback={onScrollToOfficialFeedback}
        />
      </Box>
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
