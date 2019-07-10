import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import { ICommentForAdminNotificationData } from 'services/notifications';
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
  notification: ICommentForAdminNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const NewCommentForAdminNotification = memo<Props>(props => {
  const { notification, idea } = props;

  if (isNilOrError(idea)) return null;

  const { slug } = idea.attributes;

  const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/ideas/${slug}`}
      timing={notification.attributes.created_at}
      icon="notification_comment"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userPostedComment}
        values={{
          commentAuthorFirstName: deletedUser ?
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          :
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              {notification.attributes.initiating_user_first_name}
            </Link>,
          idea: <Link
            to={`/ideas/${slug}`}
          >
            <T value={notification.attributes.idea_title} />
          </Link>
        }}
      />
    </NotificationWrapper>
  );
});

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.post.data) return null;

  return (
    <GetIdea id={notification.relationships.post.data.id}>
      {idea => <NewCommentForAdminNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
