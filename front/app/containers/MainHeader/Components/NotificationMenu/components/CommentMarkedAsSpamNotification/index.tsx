import React, { memo } from 'react';

import { ICommentMarkedAsSpamNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// data

import messages from '../../messages';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: ICommentMarkedAsSpamNotificationData;
}

const CommentMarkedAsSpamNotification = memo<Props>((props) => {
  const { notification } = props;

  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/ideas/${notification.attributes.post_slug}`}
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
