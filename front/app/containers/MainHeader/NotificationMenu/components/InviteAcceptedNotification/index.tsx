import React, { memo } from 'react';
// services
import { IInviteAcceptedNotificationData } from 'services/notifications';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';
// i18n
import messages from '../../messages';
import { DeletedUser } from '../Notification';
// components
import NotificationWrapper from '../NotificationWrapper';

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
      icon="user-check"
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
