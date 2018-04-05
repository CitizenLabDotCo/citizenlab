import * as React from 'react';

import { ICommentDeletedByAdminNotificationData } from 'services/notifications';

import messages from '../../messages';

import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import { IIdeaData } from 'services/ideas';


type Props = {
  notification: ICommentDeletedByAdminNotificationData;
  idea: IIdeaData;
};

type State = {};

class CommentDeletedByAdminNotification extends React.PureComponent<Props, State> {

  render() {
    const { notification, idea } = this.props;

    if (!idea) return null;

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

export default (props) => (
  <GetIdea>
    {(getIdeaProps) => <CommentDeletedByAdminNotification {...props} {...getIdeaProps} />}
  </GetIdea>
);
