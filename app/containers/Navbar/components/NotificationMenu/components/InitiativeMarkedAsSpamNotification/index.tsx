import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

// services
import { IInitiativeMarkedAsSpamNotificationData } from 'services/notifications';

interface Props {
  notification: IInitiativeMarkedAsSpamNotificationData;
}

const InitiativeMarkedAsSpamNotification = memo<Props>((props) => {
  const { notification } = props;

  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="initiative"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userMarkedPostAsSpam}
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
          postTitle: <T value={notification.attributes.post_title_multiloc} />,
        }}
      />
    </NotificationWrapper>
  );
});

export default InitiativeMarkedAsSpamNotification;
