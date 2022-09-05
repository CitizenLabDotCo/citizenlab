import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// services
import { IInviteAcceptedNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

interface Props {
  notification: IInviteAcceptedNotificationData;
}

const InviteAcceptedNotification = memo<Props>((props) => {
  const { notification } = props;
  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={'/admin/users/invitations'}
      timing={notification.attributes.created_at}
      icon="notification_invitation_accepted"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userAcceptedYourInvitation}
        values={{
          name: deletedUser ? (
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          ) : (
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              {notification.attributes.initiating_user_first_name}
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default InviteAcceptedNotification;
