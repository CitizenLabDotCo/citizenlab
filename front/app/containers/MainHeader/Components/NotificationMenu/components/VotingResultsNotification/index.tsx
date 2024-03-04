import React, { memo } from 'react';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import { IVotingResultsNotificationData } from 'api/notifications/types';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IVotingResultsNotificationData;
};

const VotingResultsNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="vote-ballot"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.votingResults}
        values={{
          phaseTitle: (
            <T value={notification.attributes.phase_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default VotingResultsNotification;
