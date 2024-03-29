import React, { memo } from 'react';

import { INLPFlagNotificationData } from 'api/notifications/types';

import NotificationWrapper from 'containers/MainHeader/Components/NotificationMenu/components/NotificationWrapper';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
