import React, { memo } from 'react';

import { IInviteAcceptedNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

interface Props {
  notification: IInviteAcceptedNotificationData;
}

const InviteAcceptedNotification = memo<Props>((props) => {
  const { notification } = props;

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
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default InviteAcceptedNotification;
