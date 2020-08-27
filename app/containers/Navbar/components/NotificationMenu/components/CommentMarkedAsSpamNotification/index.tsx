import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// data
import { ICommentMarkedAsSpamNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

interface Props {
  notification: ICommentMarkedAsSpamNotificationData;
}

const mapPostTypeToLink = (
  notification: ICommentMarkedAsSpamNotificationData
): string => {
  switch (notification.attributes.post_type) {
    case 'Idea':
      return `/ideas/${notification.attributes.post_slug}`;
    case 'Initiative':
      return `/initiatives/${notification.attributes.post_slug}`;
  }
};

const CommentMarkedAsSpamNotification = memo<Props>((props) => {
  const { notification } = props;

  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={mapPostTypeToLink(notification)}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userReportedCommentAsSpam}
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

export default CommentMarkedAsSpamNotification;
