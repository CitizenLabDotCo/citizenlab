import React, { memo } from 'react';
import { IVotingBasketSubmittedNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IVotingBasketSubmittedNotificationData;
};

const VotingBasketSubmittedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="vote-ballot"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.votingBasketSubmitted} />
    </NotificationWrapper>
  );
});

export default VotingBasketSubmittedNotification;
