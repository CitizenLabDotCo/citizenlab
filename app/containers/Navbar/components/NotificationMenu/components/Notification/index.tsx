import * as React from 'react';

import CommentOnYourCommentNotification from '../CommentOnYourCommentNotification';
import CommentOnYourIdeaNotification from '../CommentOnYourIdeaNotification';
import MentionInCommentNotification from '../MentionInCommentNotification';
import CommentMarkedAsSpamNotification from '../CommentMarkedAsSpamNotification';
import IdeaMarkedAsSpamNotification from '../IdeaMarkedAsSpamNotification';
import InviteAcceptedNotification from '../InviteAcceptedNotification';
import StatusChangeOfYourIdeaNotification from '../StatusChangeOfYourIdeaNotification';
import CommentDeletedByAdminNotification from '../CommentDeletedByAdminNotification';

import {
  TNotificationData,
  ICommentOnYourCommentNotificationData,
  ICommentOnYourIdeaNotificationData,
  ICommentMarkedAsSpamNotificationData,
  IIdeaMarkedAsSpamNotificationData,
  IMentionInCommentNotificationData,
  IInviteAcceptedNotificationData,
  IStatusChangeOfYourIdeaNotificationData,
  ICommentDeletedByAdminNotificationData
} from 'services/notifications';


type Props = {
  notification: TNotificationData,
};

export default class Notification extends React.PureComponent<Props> {

  render() {
    const { notification } = this.props;

    switch (notification.attributes.type) {
      case 'comment_on_your_comment':
        return <CommentOnYourCommentNotification notification={notification as ICommentOnYourCommentNotificationData} />;
      case 'comment_on_your_idea':
        return <CommentOnYourIdeaNotification notification={notification as ICommentOnYourIdeaNotificationData} />;
      case 'comment_marked_as_spam':
        return <CommentMarkedAsSpamNotification notification={notification as ICommentMarkedAsSpamNotificationData} />;
      case 'idea_marked_as_spam':
        return <IdeaMarkedAsSpamNotification notification={notification as IIdeaMarkedAsSpamNotificationData} />;
      case 'mention_in_comment':
        return <MentionInCommentNotification notification={notification as IMentionInCommentNotificationData} />;
      case 'invite_accepted':
        return <InviteAcceptedNotification notification={notification as IInviteAcceptedNotificationData} />;
      case 'status_change_of_your_idea':
        return <StatusChangeOfYourIdeaNotification notification={notification as IStatusChangeOfYourIdeaNotificationData} />;      
      case 'comment_deleted_by_admin':
        return <CommentDeletedByAdminNotification notification={notification as ICommentDeletedByAdminNotificationData} />;
      default: return null;
    }
  }
}
