import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

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

export default class InviteAcceptedNotification extends React.PureComponent<Props> {
  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification } = this.props;
    const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);

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
            name: deletedUser ?
              <DeletedUser>
                <FormattedMessage {...messages.deletedUser} />
              </DeletedUser>
              :
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={this.onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
          }}
        />
      </NotificationWrapper>
    );
  }
}
