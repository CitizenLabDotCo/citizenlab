import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import { IOfficialFeedbackOnCommentedIdeaNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

interface InputProps {
  notification: IOfficialFeedbackOnCommentedIdeaNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const OfficialFeedbackOnCommentedIdeaNotification = memo<Props>(props => {
  const { notification, idea } = props;

  if (isNilOrError(idea)) return null;

  const { slug } = idea.attributes;

  const deletedUser = isNilOrError(notification.attributes.initiating_user_slug);
  const officialFeedbackAuthorMultiloc = notification.attributes.official_feedback_author;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${slug}`}
      timing={notification.attributes.created_at}
      icon="notification_comment"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.officialFeedbackOnCommentedIdea}
        values={{
          officialName: deletedUser ?
          <DeletedUser>
            <FormattedMessage {...messages.deletedUser} />
          </DeletedUser>
          :
          <Link
            to={`/profile/${notification.attributes.initiating_user_slug}`}
            onClick={stopPropagation}
          >
            <T value={officialFeedbackAuthorMultiloc} />
          </Link>
        }}
      />
    </NotificationWrapper>
  );
});

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.idea.data) return null;

  return (
    <GetIdea id={notification.relationships.idea.data.id}>
      {idea => <OfficialFeedbackOnCommentedIdeaNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
