import React, { memo } from 'react';

import { IVotingBasketNotSubmittedNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IVotingBasketNotSubmittedNotificationData;
};

const VotingBasketNotSubmittedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="vote-ballot"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.votingBasketNotSubmitted} />
    </NotificationWrapper>
  );
});

export default VotingBasketNotSubmittedNotification;
