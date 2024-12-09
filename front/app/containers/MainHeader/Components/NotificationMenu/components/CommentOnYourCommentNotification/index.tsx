import React, { memo } from 'react';

import { ICommentOnYourCommentNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

// data

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

interface Props {
  notification: ICommentOnYourCommentNotificationData;
}

const CommentOnYourCommentNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userReactedToYourComment}
        values={{
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default CommentOnYourCommentNotification;
