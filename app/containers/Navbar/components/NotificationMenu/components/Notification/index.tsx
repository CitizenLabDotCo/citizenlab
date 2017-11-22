import * as React from 'react';

import CommentOnYourCommentNotification from '../CommentOnYourCommentNotification';
import CommentOnYourIdeaNotification from '../CommentOnYourIdeaNotification';
import MentionInCommentNotification from '../MentionInCommentNotification';

import { INotificationData } from 'services/notifications';

const componentMapping = {
  comment_on_your_comment: CommentOnYourCommentNotification,
  comment_on_your_idea: CommentOnYourIdeaNotification,
  mention_in_comment: MentionInCommentNotification,
};

type Props = {
  notification: INotificationData,
};

export default class Notification extends React.PureComponent<Props> {

  render() {
    const { notification } = this.props;
    const NotificationComponent = componentMapping[notification.attributes.type];

    return (
      <NotificationComponent notification={notification} />
    );
  }
}
