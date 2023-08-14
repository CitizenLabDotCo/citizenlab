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
import InternalCommentNotification from '../InternalCommentNotification';
import MentionInOfficialFeedbackNotification from '../MentionInOfficialFeedbackNotification';
import OfficialFeedbackOnIdeaYouFollowNotification from '../OfficialFeedbackOnIdeaYouFollowNotification';
import OfficialFeedbackOnInitiativeYouFollowNotification from '../OfficialFeedbackOnInitiativeYouFollowNotification';
import ProjectModerationRightsReceivedNotification from '../ProjectModerationRightsReceivedNotification';
import ProjectPhaseStartedNotification from '../ProjectPhaseStartedNotification';
import ProjectPhaseUpcomingNotification from '../ProjectPhaseUpcomingNotification';
import ProjectPublishedNotification from '../ProjectPublishedNotification';
import StatusChangeOnIdeaYouFollowNotification from '../StatusChangeOnIdeaYouFollowNotification';
import StatusChangeOnInitiativeYouFollowNotification from '../StatusChangeOnInitiativeYouFollowNotification';
import ThresholdReachedForAdminNotification from '../ThresholdReachedForAdminNotification';
import ProjectFolderModerationRightsReceivedNotification from '../ProjectFolderModerationRightsReceivedNotification';
import VotingBasketSubmittedNotification from '../VotingBasketSubmittedNotification';
import VotingBasketNotSubmittedNotification from '../VotingBasketNotSubmittedNotification';
import VotingLastChanceNotification from '../VotingLastChanceNotification';
import VotingResultsNotification from '../VotingResultsNotification';

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
  IInternalCommentNotificationData,
  IMentionInOfficialFeedbackNotificationData,
  IOfficialFeedbackOnIdeaYouFollowNotificationData,
  IOfficialFeedbackOnInitiativeYouFollowNotificationData,
  IProjectModerationRightsReceivedNotificationData,
  IProjectPhaseStartedNotificationData,
  IProjectPhaseUpcomingNotificationData,
  IProjectPublishedNotificationData,
  IStatusChangeOnIdeaYouFollowNotificationData,
  IStatusChangeOnInitiativeYouFollowNotificationData,
  IThresholdReachedForAdminNotificationData,
  IProjectFolderModerationRightsReceivedNotificationData,
  IVotingBasketSubmittedNotificationData,
  IVotingBasketNotSubmittedNotificationData,
  IVotingLastChanceNotificationData,
  IVotingResultsNotificationData,
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
    case 'mention_in_internal_comment':
    case 'internal_comment_on_your_internal_comment':
    case 'internal_comment_on_idea_assigned_to_you':
    case 'internal_comment_on_initiative_assigned_to_you':
    case 'internal_comment_on_idea_you_moderate':
    case 'internal_comment_on_idea_you_commented_internally_on':
    case 'internal_comment_on_initiative_you_commented_internally_on':
    case 'internal_comment_on_unassigned_unmoderated_idea':
    case 'internal_comment_on_unassigned_initiative':
      return (
        <InternalCommentNotification
          notification={notification as IInternalCommentNotificationData}
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
    case 'official_feedback_on_idea_you_follow':
      return (
        <OfficialFeedbackOnIdeaYouFollowNotification
          notification={
            notification as IOfficialFeedbackOnIdeaYouFollowNotificationData
          }
        />
      );
    case 'official_feedback_on_initiative_you_follow':
      return (
        <OfficialFeedbackOnInitiativeYouFollowNotification
          notification={
            notification as IOfficialFeedbackOnInitiativeYouFollowNotificationData
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
    case 'project_published':
      return (
        <ProjectPublishedNotification
          notification={notification as IProjectPublishedNotificationData}
        />
      );
    case 'status_change_on_idea_you_follow':
      return (
        <StatusChangeOnIdeaYouFollowNotification
          notification={
            notification as IStatusChangeOnIdeaYouFollowNotificationData
          }
        />
      );
    case 'status_change_on_initiative_you_follow':
      return (
        <StatusChangeOnInitiativeYouFollowNotification
          notification={
            notification as IStatusChangeOnInitiativeYouFollowNotificationData
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
    case 'voting_basket_submitted':
      return (
        <VotingBasketSubmittedNotification
          notification={notification as IVotingBasketSubmittedNotificationData}
        />
      );
    case 'voting_basket_not_submitted':
      return (
        <VotingBasketNotSubmittedNotification
          notification={
            notification as IVotingBasketNotSubmittedNotificationData
          }
        />
      );
    case 'voting_last_chance':
      return (
        <VotingLastChanceNotification
          notification={notification as IVotingLastChanceNotificationData}
        />
      );
    case 'voting_results':
      return (
        <VotingResultsNotification
          notification={notification as IVotingResultsNotificationData}
        />
      );
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
