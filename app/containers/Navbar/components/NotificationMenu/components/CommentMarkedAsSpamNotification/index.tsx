import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// data
import { ICommentMarkedAsSpamNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

interface InputProps {
  notification: ICommentMarkedAsSpamNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentMarkedAsSpamNotification = memo<Props>(props => {
  const { notification, idea } =  props;

  if (isNilOrError(idea)) return null;

  const { slug, title_multiloc } = idea.attributes;

  const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/ideas/${slug}`}
      timing={notification.attributes.created_at}
      icon="notification_comment"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userMarkedCommentAsSpam}
        values={{
          name: deletedUser ?
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
          ideaTitle: <T value={title_multiloc} />
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
      {idea => <CommentMarkedAsSpamNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
