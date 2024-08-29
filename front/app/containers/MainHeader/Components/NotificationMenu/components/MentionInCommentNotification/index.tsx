import React, { memo } from 'react';

import { RouteType } from 'routes';

import { IMentionInCommentNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IMentionInCommentNotificationData;
}

const mapPostTypeToLink = (
  notification: IMentionInCommentNotificationData
): RouteType => {
  switch (notification.attributes.post_type) {
    case 'Idea':
      return `/ideas/${notification.attributes.post_slug}`;
    case 'Initiative':
      return `/initiatives/${notification.attributes.post_slug}`;
  }
};

const MentionInCommentNotification = memo<Props>((props) => {
  const { notification } = props;

  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={mapPostTypeToLink(notification)}
      timing={notification.attributes.created_at}
      icon="mention"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.mentionInComment}
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

export default MentionInCommentNotification;
