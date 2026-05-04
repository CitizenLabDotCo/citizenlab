import React from 'react';

import { IAdminRightsReceivedNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IAdminRightsReceivedNotificationData;
}

const AdminRightsReceivedNotification = ({ notification }: Props) => {
  return (
    <NotificationWrapper
      to="/$locale/admin"
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.adminRightsReceived} />
    </NotificationWrapper>
  );
};

export default AdminRightsReceivedNotification;
