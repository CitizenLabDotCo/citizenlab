import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import { INewCommentForAdminNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

interface Props {
  notification: INewCommentForAdminNotificationData;
}

const mapPostTypeToLink = (notification: INewCommentForAdminNotificationData) : string => {
  switch (notification.attributes.post_type) {
    case 'Idea':
      return `/ideas/${notification.attributes.post_slug}`;
    case 'Initiative':
      return `/initiatives/${notification.attributes.post_slug}`;
  }
};

const NewCommentForAdminNotification = memo<Props>(props => {
  const { notification } = props;

  const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={mapPostTypeToLink(notification)}
      timing={notification.attributes.created_at}
      icon="notification_comment"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userPostedComment}
        values={{
          commentAuthorFirstName: deletedUser ?
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          :
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              {notification.attributes.initiating_user_first_name}
            </Link>,
          post: <Link
            to={mapPostTypeToLink(notification)}
          >
            <T value={notification.attributes.post_title_multiloc} />
          </Link>
        }}
      />
    </NotificationWrapper>
  );
});

export default NewCommentForAdminNotification;
