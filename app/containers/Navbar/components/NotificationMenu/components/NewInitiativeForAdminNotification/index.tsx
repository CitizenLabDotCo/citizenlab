import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import { INewInitiativeForAdminNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

interface Props {
  notification: INewInitiativeForAdminNotificationData;
}

const NewInitiativeForAdminNotification = memo<Props>(props => {
  const { notification } = props;

  const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="idea2"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userPostedPost}
        values={{
          name: deletedUser ?
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          :
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
            >
              {notification.attributes.initiating_user_first_name}
            </Link>,
          post: <Link
            to={`/initiatives/${notification.attributes.post_slug}`}
            onClick={stopPropagation}
          >
            <T value={notification.attributes.post_title_multiloc} />
          </Link>
        }}
      />
    </NotificationWrapper>
  );
});

export default NewInitiativeForAdminNotification;
