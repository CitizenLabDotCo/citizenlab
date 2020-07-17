import React, { memo } from 'react';
import { IStatusChangeOfYourIdeaNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IStatusChangeOfYourIdeaNotificationData;
}

const StatusChangeOfYourIdeaNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="notification_status"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.statusChangedOfYourIdea}
        values={{
          status: (
            <T value={notification.attributes.idea_status_title_multiloc} />
          ),
          ideaTitle: <T value={notification.attributes.post_title_multiloc} />,
        }}
      />
    </NotificationWrapper>
  );
});

export default StatusChangeOfYourIdeaNotification;
