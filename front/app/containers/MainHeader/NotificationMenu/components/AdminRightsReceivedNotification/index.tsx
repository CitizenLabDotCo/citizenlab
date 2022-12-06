import React, { memo } from 'react';
import { IAdminRightsReceivedNotificationData } from 'services/notifications';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IAdminRightsReceivedNotificationData;
}

const AdminRightsReceivedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={'/admin'}
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.adminRightsReceived} />
    </NotificationWrapper>
  );
});

export default AdminRightsReceivedNotification;
