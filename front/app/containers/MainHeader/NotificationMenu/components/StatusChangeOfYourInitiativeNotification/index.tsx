import React, { memo } from 'react';
import { IStatusChangeOfYourInitiativeNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IStatusChangeOfYourInitiativeNotificationData;
}

const StatusChangeOfYourInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="notification_status"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.statusChangedOfYourInitiative}
        values={{
          status: (
            <T
              value={notification.attributes.initiative_status_title_multiloc}
            />
          ),
          initiativeTitle: (
            <T value={notification.attributes.post_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default StatusChangeOfYourInitiativeNotification;
