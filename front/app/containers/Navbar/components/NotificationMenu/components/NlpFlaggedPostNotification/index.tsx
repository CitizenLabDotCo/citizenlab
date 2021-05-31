import React, { memo } from 'react';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';

// services
import { INlpFlaggedPostNotificationData } from 'services/notifications';

interface Props {
  notification: INlpFlaggedPostNotificationData;
}

const NlpFlaggedPostNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={``}
      timing={notification.attributes.created_at}
      icon=""
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.inappropriateContentAutoDetected} />
    </NotificationWrapper>
  );
});

export default NlpFlaggedPostNotification;
