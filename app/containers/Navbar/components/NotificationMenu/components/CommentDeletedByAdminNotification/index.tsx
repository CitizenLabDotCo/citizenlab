import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { ICommentDeletedByAdminNotificationData } from 'services/notifications';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

interface InputProps {
  notification: ICommentDeletedByAdminNotificationData;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {};

class CommentDeletedByAdminNotification extends React.PureComponent<Props, State> {
  render() {
    const { notification, idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${idea.attributes.slug}`}
        timing={notification.attributes.created_at}
        icon="notification_comment"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.commentDeletedByAdmin}
          values={{
            ideaTitle: <T value={idea.attributes.title_multiloc} />,
            reasonCode: notification.attributes.reason_code,
            otherReason: notification.attributes.other_reason,
          }}
        />
      </NotificationWrapper>
    );
  }
}

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.idea.data) return null;

  return (
    <GetIdea id={notification.relationships.idea.data.id}>
      {idea => <CommentDeletedByAdminNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
