import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IInitiativeAssignedToYouNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

type Props = {
  notification: IInitiativeAssignedToYouNotificationData;
};

interface State {}

export default class InitiativeAssignedToYouNotification extends React.PureComponent<
  Props,
  State
> {
  onClickUserName = (event) => {
    event.stopPropagation();
  };

  getNotificationMessage = (): JSX.Element => {
    const { notification } = this.props;
    const sharedValues = {
      postTitle: <T value={notification.attributes.post_title_multiloc} />,
    };

    if (isNilOrError(notification.attributes.initiating_user_slug)) {
      return (
        <FormattedMessage
          {...messages.postAssignedToYou}
          values={{
            ...sharedValues,
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          {...messages.xAssignedPostToYou}
          values={{
            ...sharedValues,
            name: (
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={this.onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
            ),
          }}
        />
      );
    }
  };

  render() {
    const { notification } = this.props;

    return (
      <NotificationWrapper
        linkTo={'/admin/initiatives/manage'}
        timing={notification.attributes.created_at}
        icon="initiative"
        isRead={!!notification.attributes.read_at}
      >
        {this.getNotificationMessage()}
      </NotificationWrapper>
    );
  }
}
