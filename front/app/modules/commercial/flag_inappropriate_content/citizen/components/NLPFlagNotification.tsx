import React, { memo } from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from 'containers/MainHeader/NotificationMenu/components/NotificationWrapper';

// services
import { INLPFlagNotificationData } from 'services/notifications';

interface Props {
  notification: INLPFlagNotificationData;
}

const NLPFlagNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={notification.attributes.flaggable_path}
      timing={notification.attributes.created_at}
      icon="flag"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.inappropriateContentAutoDetected} />
    </NotificationWrapper>
  );
});

export default NLPFlagNotification;
