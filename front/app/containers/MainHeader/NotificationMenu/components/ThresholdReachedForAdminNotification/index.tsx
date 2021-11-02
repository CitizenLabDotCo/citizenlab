import React, { memo } from 'react';
import { stopPropagation } from 'utils/helperUtils';
import { IThresholdReachedForAdminNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IThresholdReachedForAdminNotificationData;
}

const ThresholdReachedForAdminNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="notification_status"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.thresholdReachedForAdmin}
        values={{
          post: (
            <Link
              to={`/initiatives/${notification.attributes.post_slug}`}
              onClick={stopPropagation}
            >
              <T value={notification.attributes.post_title_multiloc} />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default ThresholdReachedForAdminNotification;
