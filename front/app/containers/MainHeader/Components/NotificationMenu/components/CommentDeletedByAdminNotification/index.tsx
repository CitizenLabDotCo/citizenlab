import React from 'react';

import { ICommentDeletedByAdminNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: ICommentDeletedByAdminNotificationData;
}

const CommentDeletedByAdminNotification = ({ notification }: Props) => {
  const slug = notification.attributes.post_slug;

  if (!slug) return null;

  return (
    <NotificationWrapper
      to="/ideas/$slug"
      params={{ slug }}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.commentDeletedByAdminFor}
        values={{
          postTitle: <T value={notification.attributes.post_title_multiloc} />,
          reasonCode: notification.attributes.reason_code,
          otherReason: notification.attributes.other_reason,
        }}
      />
    </NotificationWrapper>
  );
};

export default CommentDeletedByAdminNotification;
