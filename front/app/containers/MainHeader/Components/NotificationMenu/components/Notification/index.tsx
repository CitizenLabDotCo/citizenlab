import React from 'react';

import {
  TNotificationData,
  IAdminRightsReceivedNotificationData,
  ICommentDeletedByAdminNotificationData,
  ICommentMarkedAsSpamNotificationData,
  ICommentOnYourCommentNotificationData,
  ICommentOnIdeaYouFollowNotificationData,
  IIdeaAssignedToYouNotificationData,
  IIdeaMarkedAsSpamNotificationData,
  IInviteAcceptedNotificationData,
  IInvitationToCosponsorIdeaNotificationData,
  IMentionInCommentNotificationData,
  IInternalCommentNotificationData,
  IMentionInOfficialFeedbackNotificationData,
  IOfficialFeedbackOnIdeaYouFollowNotificationData,
  IProjectModerationRightsReceivedNotificationData,
  IProjectPhaseStartedNotificationData,
  IProjectPhaseUpcomingNotificationData,
  IProjectPublishedNotificationData,
  IProjectReviewRequestNotificationData,
  IProjectReviewStateChangeNotificationData,
  IStatusChangeOnIdeaYouFollowNotificationData,
  IProjectFolderModerationRightsReceivedNotificationData,
  IVotingBasketSubmittedNotificationData,
  INativeSurveyNotSubmittedNotificationData,
  IVotingBasketNotSubmittedNotificationData,
  IVotingLastChanceNotificationData,
  IVotingResultsNotificationData,
  ICosponsorOfYourIdeaNotificationData,
} from 'api/notifications/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Outlet from 'components/Outlet';

import AdminRightsReceivedNotification from '../AdminRightsReceivedNotification';
import CommentDeletedByAdminNotification from '../CommentDeletedByAdminNotification';
import CommentMarkedAsSpamNotification from '../CommentMarkedAsSpamNotification';
import CommentOnIdeaYouFollowNotification from '../CommentOnIdeaYouFollowNotification';
import CommentOnYourCommentNotification from '../CommentOnYourCommentNotification';
import CosponsorOfYourIdeaNotification from '../CosponsorOfYourIdeaNotification';
import IdeaAssignedToYouNotification from '../IdeaAssignedToYouNotification';
import IdeaMarkedAsSpamNotification from '../IdeaMarkedAsSpamNotification';
import InternalCommentNotification from '../InternalCommentNotification';
import InvitationToCosponsorIdeaNotification from '../InvitationToCosponsorIdeaNotification';
import InviteAcceptedNotification from '../InviteAcceptedNotification';
import MentionInCommentNotification from '../MentionInCommentNotification';
import MentionInOfficialFeedbackNotification from '../MentionInOfficialFeedbackNotification';
import NativeSurveyNotSubmittedNotification from '../NativeSurveyNotSubmittedNotification';
import OfficialFeedbackOnIdeaYouFollowNotification from '../OfficialFeedbackOnIdeaYouFollowNotification';
import ProjectFolderModerationRightsReceivedNotification from '../ProjectFolderModerationRightsReceivedNotification';
import ProjectModerationRightsReceivedNotification from '../ProjectModerationRightsReceivedNotification';
import ProjectPhaseStartedNotification from '../ProjectPhaseStartedNotification';
import ProjectPhaseUpcomingNotification from '../ProjectPhaseUpcomingNotification';
import ProjectPublishedNotification from '../ProjectPublishedNotification';
import ProjectReviewRequestNotification from '../ProjectReviewRequestNotification';
import ProjectReviewStateChangeNotification from '../ProjectReviewStateChangeNotification';
import StatusChangeOnIdeaYouFollowNotification from '../StatusChangeOnIdeaYouFollowNotification';
import VotingBasketNotSubmittedNotification from '../VotingBasketNotSubmittedNotification';
import VotingBasketSubmittedNotification from '../VotingBasketSubmittedNotification';
import VotingLastChanceNotification from '../VotingLastChanceNotification';
import VotingResultsNotification from '../VotingResultsNotification';

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
    case 'comment_on_idea_you_follow':
      return (
        <CommentOnIdeaYouFollowNotification
          notification={notification as ICommentOnIdeaYouFollowNotificationData}
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

    case 'invite_accepted':
      return (
        <InviteAcceptedNotification
          notification={notification as IInviteAcceptedNotificationData}
        />
      );

    case 'invitation_to_cosponsor_idea':
      return (
        <InvitationToCosponsorIdeaNotification
          notification={
            notification as IInvitationToCosponsorIdeaNotificationData
          }
        />
      );
    case 'cosponsor_of_your_idea':
      return (
        <CosponsorOfYourIdeaNotification
          notification={notification as ICosponsorOfYourIdeaNotificationData}
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
    case 'internal_comment_on_idea_you_moderate':
    case 'internal_comment_on_idea_you_commented_internally_on':
    case 'internal_comment_on_unassigned_unmoderated_idea':
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
    case 'project_review_request':
      return (
        <ProjectReviewRequestNotification
          notification={notification as IProjectReviewRequestNotificationData}
        />
      );
    case 'project_review_state_change':
      return (
        <ProjectReviewStateChangeNotification
          notification={
            notification as IProjectReviewStateChangeNotificationData
          }
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
    case 'native_survey_not_submitted':
      return (
        <NativeSurveyNotSubmittedNotification
          notification={
            notification as INativeSurveyNotSubmittedNotificationData
          }
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
