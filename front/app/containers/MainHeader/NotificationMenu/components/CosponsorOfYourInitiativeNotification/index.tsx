import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import { DeletedUser } from '../Notification';
import Link from 'utils/cl-router/Link';

// services
import { ICosponsorOfYourInitiativeNotificationData } from 'api/notifications/types';

interface Props {
  notification: ICosponsorOfYourInitiativeNotificationData;
}

const CosponsorOfYourInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="label"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.cosponsorOfYourInitiative}
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

export default CosponsorOfYourInitiativeNotification;
