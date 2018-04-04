import * as React from 'react';

import { IInviteAcceptedNotificationData } from 'services/notifications';

import messages from '../../messages';

import { FormattedMessage } from 'utils/cl-intl';
import NotificationWrapper from '../NotificationWrapper';
import { Link } from 'react-router';


type Props = {
  notification: IInviteAcceptedNotificationData;
};

type State = {
};

export default class InviteAcceptedNotification extends React.PureComponent<Props, State> {

  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification } = this.props;

    return (
      <NotificationWrapper
        linkTo={`/admin/users/invitations`}
        timing={notification.attributes.created_at}
        icon="notification_invitation_accepted"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.userAcceptedYourInvitation}
          values={{
            name:
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
