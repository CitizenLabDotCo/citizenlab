import React, { PureComponent } from 'react';
import CommentOnYourCommentNotification from '../CommentOnYourCommentNotification';
import CommentOnYourIdeaNotification from '../CommentOnYourIdeaNotification';
import MentionInCommentNotification from '../MentionInCommentNotification';
import CommentMarkedAsSpamNotification from '../CommentMarkedAsSpamNotification';
import IdeaMarkedAsSpamNotification from '../IdeaMarkedAsSpamNotification';
import InviteAcceptedNotification from '../InviteAcceptedNotification';
import StatusChangeOfYourIdeaNotification from '../StatusChangeOfYourIdeaNotification';
import CommentDeletedByAdminNotification from '../CommentDeletedByAdminNotification';
import ProjectModerationRightsReceivedNotification from '../ProjectModerationRightsReceivedNotification';
import AdminRightsReceivedNotification from '../AdminRightsReceivedNotification';
import NewIdeaForAdminNotification from '../NewIdeaForAdminNotification';
import NewCommentForAdminNotification from '../NewCommentForAdminNotification';
import OfficialFeedbackOnYourIdeaNotification from '../OfficialFeedbackOnYourIdeaNotification';
import OfficialFeedbackOnVotedIdeaNotification from '../OfficialFeedbackOnVotedIdeaNotification';
import OfficialFeedbackOnCommentedIdeaNotification from '../OfficialFeedbackOnCommentedIdeaNotification';
import MentionInOfficialFeedbackNotification from '../MentionInOfficialFeedbackNotification';

import {
  TNotificationData,
  ICommentOnYourCommentNotificationData,
  ICommentOnYourIdeaNotificationData,
  ICommentMarkedAsSpamNotificationData,
  IIdeaMarkedAsSpamNotificationData,
  IMentionInCommentNotificationData,
  IInviteAcceptedNotificationData,
  IStatusChangeOfYourIdeaNotificationData,
  ICommentDeletedByAdminNotificationData,
  IProjectModerationRightsReceivedNotificationData,
  IAdminRightsReceivedNotificationData,
  IIdeaForAdminNotificationData,
  ICommentForAdminNotificationData,
  IOfficialFeedbackOnYourIdeaNotificationData,
  IOfficialFeedbackOnVotedIdeaNotificationData,
  IOfficialFeedbackOnCommentedIdeaNotificationData,
  IMentionInOfficialFeedbackNotificationData
} from 'services/notifications';
import styled from 'styled-components';

export const DeletedUser = styled.span`
  font-style: italic;
`;

type Props = {
  notification: TNotificationData,
};

export default class Notification extends PureComponent<Props> {
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
      case 'project_moderation_rights_received':
        return <ProjectModerationRightsReceivedNotification notification={notification as IProjectModerationRightsReceivedNotificationData} />;
      case 'admin_rights_received':
        return <AdminRightsReceivedNotification notification={notification as IAdminRightsReceivedNotificationData} />;
      case 'new_idea_for_admin':
        return <NewIdeaForAdminNotification notification={notification as IIdeaForAdminNotificationData} />;
      case 'new_comment_for_admin':
        return <NewCommentForAdminNotification notification={notification as ICommentForAdminNotificationData} />;
      case 'official_feedback_on_your_idea':
        return <OfficialFeedbackOnYourIdeaNotification notification={notification as IOfficialFeedbackOnYourIdeaNotificationData} />;
      case 'official_feedback_on_voted_idea':
        return <OfficialFeedbackOnVotedIdeaNotification notification={notification as IOfficialFeedbackOnVotedIdeaNotificationData} />;
      case 'official_feedback_on_commented_idea':
        return <OfficialFeedbackOnCommentedIdeaNotification notification={notification as IOfficialFeedbackOnCommentedIdeaNotificationData} />;
      case 'mention_in_official_feedback':
        return <MentionInOfficialFeedbackNotification notification={notification as IMentionInOfficialFeedbackNotificationData} />;
      default: return null;
    }
  }
}
