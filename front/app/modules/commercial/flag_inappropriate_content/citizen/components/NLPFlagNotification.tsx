import React, { memo } from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from 'containers/NavBar/components/NotificationMenu/components/NotificationWrapper';

// services
import { INlpFlaggedPostNotificationData } from 'services/notifications';

interface Props {
  notification: INlpFlaggedPostNotificationData;
}

const NLPFlagNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={notification.attributes.flaggable_url}
      timing={notification.attributes.created_at}
      icon="flag"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.inappropriateContentAutoDetected} />
    </NotificationWrapper>
  );
});

export default NLPFlagNotification;
