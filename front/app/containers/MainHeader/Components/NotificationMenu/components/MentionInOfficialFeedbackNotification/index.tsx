import React, { memo } from 'react';

import { IMentionInOfficialFeedbackNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import { DeletedUser } from '../UserLink';

interface Props {
  notification: IMentionInOfficialFeedbackNotificationData;
}

const MentionInCommentNotification = memo<Props>((props) => {
  const { notification } = props;

  const officialFeedbackAuthorMultiloc =
    notification.attributes.official_feedback_author;
  const deletedUser = isNilOrError(
    notification.attributes.initiating_user_slug
  );

  return (
    <NotificationWrapper
      linkTo={`/ideas/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="mention"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.mentionInOfficialFeedback}
        values={{
          officialName: deletedUser ? (
            <DeletedUser />
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
