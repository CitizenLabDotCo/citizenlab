import React, { memo } from 'react';
import { IStatusChangeOnVotedInitiativeNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IStatusChangeOnVotedInitiativeNotificationData;
}

const StatusChangeOnVotedInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="notification_status"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.statusChangeOnVotedInitiative}
        values={{
          status: (
            <T
              value={notification.attributes.initiative_status_title_multiloc}
            />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default StatusChangeOnVotedInitiativeNotification;
