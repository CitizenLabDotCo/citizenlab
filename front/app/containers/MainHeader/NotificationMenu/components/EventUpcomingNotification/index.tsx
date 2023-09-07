import React, { memo } from 'react';
import { IEventUpcomingNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface Props {
  notification: IEventUpcomingNotificationData;
}

const EventUpcomingNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/events/${notification.attributes.event_id}`}
      timing={notification.attributes.created_at}
      icon="calendar"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.eventUpcoming}
        values={{
          eventTitle: (
            <T value={notification.attributes.event_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default EventUpcomingNotification;
