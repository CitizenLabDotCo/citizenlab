import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// services
import { IMentionInOfficialFeedbackNotificationData } from 'services/notifications';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IMentionInOfficialFeedbackNotificationData;
}

const mapPostTypeToLink = (
  notification: IMentionInOfficialFeedbackNotificationData
): string => {
  switch (notification.attributes.post_type) {
    case 'Idea':
      return `/ideas/${notification.attributes.post_slug}`;
    case 'Initiative':
      return `/initiatives/${notification.attributes.post_slug}`;
  }
};

const MentionInCommentNotification = memo<Props>((props) => {
  const { notification } = props;

  const officialFeedbackAuthorMultiloc =
    notification.attributes.official_feedback_author;
  const deletedUser = isNilOrError(
    notification.attributes.initiating_user_slug
  );

  return (
    <NotificationWrapper
      linkTo={mapPostTypeToLink(notification)}
      timing={notification.attributes.created_at}
      icon="notification_mention"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.mentionInOfficialFeedback}
        values={{
          officialName: deletedUser ? (
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          ) : (
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              <T value={officialFeedbackAuthorMultiloc} />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default MentionInCommentNotification;
