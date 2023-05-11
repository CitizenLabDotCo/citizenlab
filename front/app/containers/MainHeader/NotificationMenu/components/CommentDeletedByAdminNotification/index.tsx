import React from 'react';
import { ICommentDeletedByAdminNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: ICommentDeletedByAdminNotificationData;
}

const mapPostTypeToLink = (
  notification: ICommentDeletedByAdminNotificationData
): string => {
  switch (notification.attributes.post_type) {
    case 'Idea':
      return `/ideas/${notification.attributes.post_slug}`;
    case 'Initiative':
      return `/initiatives/${notification.attributes.post_slug}`;
  }
};

const CommentDeletedByAdminNotification = ({ notification }: Props) => {
  return (
    <NotificationWrapper
      linkTo={mapPostTypeToLink(notification)}
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
