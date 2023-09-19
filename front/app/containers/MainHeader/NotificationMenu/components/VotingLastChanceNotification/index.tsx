import React, { memo } from 'react';
import { IVotingLastChanceNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// components
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IVotingLastChanceNotificationData;
};

const VotingLastChanceNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="vote-ballot"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.votingLastChance}
        values={{
          phaseTitle: (
            <T value={notification.attributes.phase_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default VotingLastChanceNotification;
