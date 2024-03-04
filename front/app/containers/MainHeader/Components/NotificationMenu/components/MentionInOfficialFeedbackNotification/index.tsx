import React, { memo } from 'react';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import { IMentionInOfficialFeedbackNotificationData } from 'api/notifications/types';

import messages from '../../messages';
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
      icon="mention"
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
