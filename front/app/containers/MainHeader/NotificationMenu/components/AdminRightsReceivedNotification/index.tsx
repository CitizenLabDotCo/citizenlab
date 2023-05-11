import React from 'react';
import { IAdminRightsReceivedNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IAdminRightsReceivedNotificationData;
}

const AdminRightsReceivedNotification = ({ notification }: Props) => {
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
};

export default AdminRightsReceivedNotification;
