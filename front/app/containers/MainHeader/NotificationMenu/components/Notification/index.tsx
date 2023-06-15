import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AdminRightsReceivedNotification from '../AdminRightsReceivedNotification';
import CommentDeletedByAdminNotification from '../CommentDeletedByAdminNotification';
import CommentMarkedAsSpamNotification from '../CommentMarkedAsSpamNotification';
import CommentOnYourCommentNotification from '../CommentOnYourCommentNotification';
import CommentOnYourIdeaNotification from '../CommentOnYourIdeaNotification';
import CommentOnYourInitiativeNotification from '../CommentOnYourInitiativeNotification';
import IdeaAssignedToYouNotification from '../IdeaAssignedToYouNotification';
import IdeaMarkedAsSpamNotification from '../IdeaMarkedAsSpamNotification';
import InitiativeAssignedToYouNotification from '../InitiativeAssignedToYouNotification';
import InitiativeMarkedAsSpamNotification from '../InitiativeMarkedAsSpamNotification';
import InviteAcceptedNotification from '../InviteAcceptedNotification';
import MentionInCommentNotification from '../MentionInCommentNotification';
import MentionInOfficialFeedbackNotification from '../MentionInOfficialFeedbackNotification';
import OfficialFeedbackOnCommentedIdeaNotification from '../OfficialFeedbackOnCommentedIdeaNotification';
import OfficialFeedbackOnCommentedInitiativeNotification from '../OfficialFeedbackOnCommentedInitiativeNotification';
import OfficialFeedbackOnReactedIdeaNotification from '../OfficialFeedbackOnReactedIdeaNotification';
import OfficialFeedbackOnReactedInitiativeNotification from '../OfficialFeedbackOnReactedInitiativeNotification';
import OfficialFeedbackOnYourIdeaNotification from '../OfficialFeedbackOnYourIdeaNotification';
import OfficialFeedbackOnYourInitiativeNotification from '../OfficialFeedbackOnYourInitiativeNotification';
import ProjectModerationRightsReceivedNotification from '../ProjectModerationRightsReceivedNotification';
import ProjectPhaseStartedNotification from '../ProjectPhaseStartedNotification';
import ProjectPhaseUpcomingNotification from '../ProjectPhaseUpcomingNotification';
import StatusChangeOfYourIdeaNotification from '../StatusChangeOfYourIdeaNotification';
import StatusChangeOfYourInitiativeNotification from '../StatusChangeOfYourInitiativeNotification';
import StatusChangeOnCommentedIdeaNotification from '../StatusChangeOnCommentedIdeaNotification';
import StatusChangeOnCommentedInitiativeNotification from '../StatusChangeOnCommentedInitiativeNotification';
import StatusChangeOnReactedIdeaNotification from '../StatusChangeOnReactedIdeaNotification';
import StatusChangeOnReactedInitiativeNotification from '../StatusChangeOnReactedInitiativeNotification';
import ThresholdReachedForAdminNotification from '../ThresholdReachedForAdminNotification';
import ProjectFolderModerationRightsReceivedNotification from '../ProjectFolderModerationRightsReceivedNotification';

import {
  TNotificationData,
  IAdminRightsReceivedNotificationData,
  ICommentDeletedByAdminNotificationData,
  ICommentMarkedAsSpamNotificationData,
  ICommentOnYourCommentNotificationData,
  ICommentOnYourIdeaNotificationData,
  ICommentOnYourInitiativeNotificationData,
  IIdeaAssignedToYouNotificationData,
  IIdeaMarkedAsSpamNotificationData,
  IInitiativeAssignedToYouNotificationData,
  IInitiativeMarkedAsSpamNotificationData,
  IInviteAcceptedNotificationData,
  IMentionInCommentNotificationData,
  IMentionInOfficialFeedbackNotificationData,
  IOfficialFeedbackOnCommentedIdeaNotificationData,
  IOfficialFeedbackOnCommentedInitiativeNotificationData,
  IOfficialFeedbackOnReactedIdeaNotificationData,
  IOfficialFeedbackOnReactedInitiativeNotificationData,
  IOfficialFeedbackOnYourIdeaNotificationData,
  IOfficialFeedbackOnYourInitiativeNotificationData,
  IProjectModerationRightsReceivedNotificationData,
  IProjectPhaseStartedNotificationData,
  IProjectPhaseUpcomingNotificationData,
  IStatusChangeOfYourIdeaNotificationData,
  IStatusChangeOfYourInitiativeNotificationData,
  IStatusChangeOnCommentedIdeaNotificationData,
  IStatusChangeOnCommentedInitiativeNotificationData,
  IStatusChangeOnReactedIdeaNotificationData,
  IStatusChangeOnReactedInitiativeNotificationData,
  IThresholdReachedForAdminNotificationData,
  IProjectFolderModerationRightsReceivedNotificationData,
} from 'api/notifications/types';
import styled from 'styled-components';
import Outlet from 'components/Outlet';

export const DeletedUser = styled.span`
  font-style: italic;
`;

type Props = {
  notification: TNotificationData;
};

const Notification = ({ notification }: Props) => {
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  switch (notification.attributes.type) {
    case 'admin_rights_received':
      return (
        <AdminRightsReceivedNotification
          notification={notification as IAdminRightsReceivedNotificationData}
        />
      );
    case 'comment_deleted_by_admin':
      return (
        <CommentDeletedByAdminNotification
          notification={notification as ICommentDeletedByAdminNotificationData}
        />
      );
    case 'comment_marked_as_spam':
      return (
        <CommentMarkedAsSpamNotification
          notification={notification as ICommentMarkedAsSpamNotificationData}
        />
      );
    case 'comment_on_your_comment':
      return (
        <CommentOnYourCommentNotification
          notification={notification as ICommentOnYourCommentNotificationData}
        />
      );
    case 'comment_on_your_idea':
      return (
        <CommentOnYourIdeaNotification
          notification={notification as ICommentOnYourIdeaNotificationData}
        />
      );
    case 'comment_on_your_initiative':
      return (
        <CommentOnYourInitiativeNotification
          notification={
            notification as ICommentOnYourInitiativeNotificationData
          }
        />
      );
    case 'idea_assigned_to_you':
      return (
        <IdeaAssignedToYouNotification
          notification={notification as IIdeaAssignedToYouNotificationData}
        />
      );
    case 'idea_marked_as_spam':
      return (
        <IdeaMarkedAsSpamNotification
          notification={notification as IIdeaMarkedAsSpamNotificationData}
        />
      );
    case 'initiative_assigned_to_you':
      return (
        <InitiativeAssignedToYouNotification
          notification={
            notification as IInitiativeAssignedToYouNotificationData
          }
        />
      );
    case 'initiative_marked_as_spam':
      return (
        <InitiativeMarkedAsSpamNotification
          notification={notification as IInitiativeMarkedAsSpamNotificationData}
        />
      );
    case 'invite_accepted':
      return (
        <InviteAcceptedNotification
          notification={notification as IInviteAcceptedNotificationData}
        />
      );
    case 'mention_in_comment':
      return (
        <MentionInCommentNotification
          notification={notification as IMentionInCommentNotificationData}
        />
      );
    case 'mention_in_official_feedback':
      return (
        <MentionInOfficialFeedbackNotification
          notification={
            notification as IMentionInOfficialFeedbackNotificationData
          }
        />
      );
    case 'official_feedback_on_commented_idea':
      return (
        <OfficialFeedbackOnCommentedIdeaNotification
          notification={
            notification as IOfficialFeedbackOnCommentedIdeaNotificationData
          }
        />
      );
    case 'official_feedback_on_commented_initiative':
      return (
        <OfficialFeedbackOnCommentedInitiativeNotification
          notification={
            notification as IOfficialFeedbackOnCommentedInitiativeNotificationData
          }
        />
      );
    case 'official_feedback_on_reacted_idea':
      return (
        <OfficialFeedbackOnReactedIdeaNotification
          notification={
            notification as IOfficialFeedbackOnReactedIdeaNotificationData
          }
        />
      );
    case 'official_feedback_on_reacted_initiative':
      return (
        <OfficialFeedbackOnReactedInitiativeNotification
          notification={
            notification as IOfficialFeedbackOnReactedInitiativeNotificationData
          }
        />
      );
    case 'official_feedback_on_your_idea':
      return (
        <OfficialFeedbackOnYourIdeaNotification
          notification={
            notification as IOfficialFeedbackOnYourIdeaNotificationData
          }
        />
      );
    case 'official_feedback_on_your_initiative':
      return (
        <OfficialFeedbackOnYourInitiativeNotification
          notification={
            notification as IOfficialFeedbackOnYourInitiativeNotificationData
          }
        />
      );
    case 'project_moderation_rights_received':
      return (
        <ProjectModerationRightsReceivedNotification
          notification={
            notification as IProjectModerationRightsReceivedNotificationData
          }
        />
      );
    case 'project_phase_started':
      return (
        <ProjectPhaseStartedNotification
          notification={notification as IProjectPhaseStartedNotificationData}
        />
      );
    case 'project_phase_upcoming':
      return (
        <ProjectPhaseUpcomingNotification
          notification={notification as IProjectPhaseUpcomingNotificationData}
        />
      );
    case 'status_change_of_your_idea':
      return (
        <StatusChangeOfYourIdeaNotification
          notification={notification as IStatusChangeOfYourIdeaNotificationData}
        />
      );
    case 'status_change_of_your_initiative':
      return (
        <StatusChangeOfYourInitiativeNotification
          notification={
            notification as IStatusChangeOfYourInitiativeNotificationData
          }
        />
      );
    case 'status_change_on_commented_idea':
      return (
        <StatusChangeOnCommentedIdeaNotification
          notification={
            notification as IStatusChangeOnCommentedIdeaNotificationData
          }
        />
      );
    case 'status_change_on_commented_initiative':
      return (
        <StatusChangeOnCommentedInitiativeNotification
          notification={
            notification as IStatusChangeOnCommentedInitiativeNotificationData
          }
        />
      );
    case 'status_change_on_reacted_idea':
      return (
        <StatusChangeOnReactedIdeaNotification
          notification={
            notification as IStatusChangeOnReactedIdeaNotificationData
          }
        />
      );
    case 'status_change_on_reacted_initiative':
      return (
        <StatusChangeOnReactedInitiativeNotification
          notification={
            notification as IStatusChangeOnReactedInitiativeNotificationData
          }
        />
      );
    case 'threshold_reached_for_admin':
      return (
        <ThresholdReachedForAdminNotification
          notification={
            notification as IThresholdReachedForAdminNotificationData
          }
        />
      );
    case 'project_folder_moderation_rights_received':
      if (isProjectFoldersEnabled) {
        return (
          <ProjectFolderModerationRightsReceivedNotification
            notification={
              notification as IProjectFolderModerationRightsReceivedNotificationData
            }
          />
        );
      } else {
        return null;
      }
    default:
      return (
        <Outlet
          id="app.components.NotificationMenu.Notification"
          notification={notification}
        />
      );
  }
};

export default Notification;
