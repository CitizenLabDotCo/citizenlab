/*
 * NotificationMenu Messages
 *
 * This contains all the text for the NotificationMenu component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.NotificationMenu.loading',
    defaultMessage: 'Loading notifications...',
  },
  error: {
    id: 'app.containers.NotificationMenu.error',
    defaultMessage: "Couldn't load notifications",
  },
  loadMore: {
    id: 'app.containers.NotificationMenu.loadMore',
    defaultMessage: 'Load more...',
  },
  noNotifications: {
    id: 'app.containers.NotificationMenu.noNotifications',
    defaultMessage: "You don't have any notifications yet",
  },
  cosponsorOfYourInitiative: {
    id: 'app.containers.NotificationMenu.cosponsorOfYourInitiative',
    defaultMessage: '{name} cosponsored your proposal',
  },
  userCommentedOnIdeaYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnIdeaYouFollow',
    defaultMessage: '{name} commented on an idea that you follow',
  },
  userCommentedOnOptionYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnOptionYouFollow',
    defaultMessage: '{name} commented on an option that you follow',
  },
  userCommentedOnProjectYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnProjectYouFollow',
    defaultMessage: '{name} commented on a project that you follow',
  },
  userCommentedOnQuestionYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnQuestionYouFollow',
    defaultMessage: '{name} commented on a question that you follow',
  },
  userCommentedOnIssueYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnIssueYouFollow',
    defaultMessage: '{name} commented on a issue that you follow',
  },
  userCommentedOnContributionYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnContributionYouFollow',
    defaultMessage: '{name} commented on a contribution that you follow',
  },
  userCommentedOnInitiativeYouFollow: {
    id: 'app.containers.NotificationMenu.userCommentedOnInitiativeYouFollow',
    defaultMessage: '{name} commented on an initiative that you follow',
  },
  userReactedToYourComment: {
    id: 'app.containers.NotificationMenu.userReactedToYourComment',
    defaultMessage: '{name} reacted to your comment',
  },
  mentionInComment: {
    id: 'app.containers.NotificationMenu.mentionInComment',
    defaultMessage: '{name} mentioned you in a comment',
  },
  mentionInInternalComment: {
    id: 'app.containers.NotificationMenu.mentionInInternalComment',
    defaultMessage: '{name} mentioned you in an internal comment',
  },
  initiativeResubmittedForReview: {
    id: 'app.containers.NotificationMenu.initiativeResubmittedForReview',
    defaultMessage: '"{initiativeTitle}" resubmitted for review',
  },
  internalCommentOnYourInternalComment: {
    id: 'app.containers.NotificationMenu.internalCommentOnYourInternalComment',
    defaultMessage: '{name} commented on your internal comment',
  },
  internalCommentOnIdeaAssignedToYou: {
    id: 'app.containers.NotificationMenu.internalCommentOnIdeaAssignedToYou',
    defaultMessage: '{name} commented internally on an input assigned to you',
  },
  internalCommentOnInitiativeAssignedToYou: {
    id: 'app.containers.NotificationMenu.internalCommentOnInitiativeAssignedToYou',
    defaultMessage: '{name} commented internally on a proposal assigned to you',
  },
  internalCommentOnIdeaYouModerate: {
    id: 'app.containers.NotificationMenu.internalCommentOnIdeaYouModerate',
    defaultMessage:
      '{name} commented internally on an input in a project you manage',
  },
  internalCommentOnIdeaYouCommentedInternallyOn: {
    id: 'app.containers.NotificationMenu.internalCommentOnIdeaYouCommentedInternallyOn',
    defaultMessage:
      '{name} commented internally on an input that you commented on internally',
  },
  internalCommentOnInitiativeYouCommentedInternallyOn: {
    id: 'app.containers.NotificationMenu.internalCommentOnInitiativeYouCommentedInternallyOn',
    defaultMessage:
      '{name} commented internally on a proposal that you commented on internally',
  },
  internalCommentOnUnassignedUnmoderatedIdea: {
    id: 'app.containers.NotificationMenu.internalCommentOnUnassignedUnmoderatedIdea',
    defaultMessage:
      '{name} commented internally on an unassigned input in an unmanaged project',
  },
  internalCommentOnUnassignedInitiative: {
    id: 'app.containers.NotificationMenu.internalCommentOnUnassignedInitiative',
    defaultMessage: '{name} commented internally on an unassigned proposal',
  },
  invitationToCosponsorInitiative: {
    id: 'app.containers.NotificationMenu.invitationToCosponsorInitiative',
    defaultMessage: '{name} invited you to cosponsor a proposal',
  },
  userReportedCommentAsSpam: {
    id: 'app.containers.NotificationMenu.userReportedCommentAsSpam1',
    defaultMessage: '{name} reported a comment on "{postTitle}" as spam',
  },
  userMarkedPostAsSpam: {
    id: 'app.containers.NotificationMenu.userMarkedPostAsSpam1',
    defaultMessage: '{name} reported "{postTitle}" as spam',
  },
  statusChangedOnIdeaYouFollow: {
    id: 'app.containers.NotificationMenu.statusChangedOnIdeaYouFollow',
    defaultMessage: '{ideaTitle} status has changed to {status}',
  },
  statusChangedOnInitiativeYouFollow: {
    id: 'app.containers.NotificationMenu.statusChangedOnInitiativeYouFollow',
    defaultMessage: '{initiativeTitle} status has changed to {status}',
  },
  thresholdReachedForAdmin: {
    id: 'app.containers.NotificationMenu.thresholdReachedForAdmin',
    defaultMessage: '{post} reached the voting threshold',
  },
  userAcceptedYourInvitation: {
    id: 'app.containers.NotificationMenu.userAcceptedYourInvitation',
    defaultMessage: '{name} accepted your invitation',
  },
  commentDeletedByAdminFor: {
    id: 'app.containers.NotificationMenu.commentDeletedByAdminFor1',
    defaultMessage: `Your comment on "{postTitle}" has been deleted by an admin because
      {reasonCode, select,
        irrelevant {it is irrelevant}
        inappropriate {its content is inappropriate}
        other {{otherReason}}
      }
    `,
  },
  projectModerationRightsReceived: {
    id: 'app.containers.NotificationMenu.projectModerationRightsReceived',
    defaultMessage: "You're now a moderator of {projectLink}",
  },
  adminRightsReceived: {
    id: 'app.containers.NotificationMenu.adminRightsReceived',
    defaultMessage: "You're now an administrator of the platform",
  },
  notificationsLabel: {
    id: 'app.containers.NotificationMenu.notificationsLabel',
    defaultMessage: 'Notifications',
  },
  a11y_notificationsLabel: {
    id: 'app.containers.NotificationMenu.a11y_notificationsLabel',
    defaultMessage:
      '{count, plural, =0 {no unviewed notifications} one {1 unviewed notification} other {# unviewed notifications}}',
  },
  deletedUser: {
    id: 'app.containers.NotificationMenu.deletedUser',
    defaultMessage: 'Deleted user',
  },
  officialFeedbackOnIdeaYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnIdeaYouFollow',
    defaultMessage:
      '{officialName} gave an official update on an idea you follow',
  },
  officialFeedbackOnProjectYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnProjectYouFollow',
    defaultMessage:
      '{officialName} gave an official update on a project you follow',
  },
  officialFeedbackOnOptionYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnOptionYouFollow',
    defaultMessage:
      '{officialName} gave an official update on an option you follow',
  },
  officialFeedbackOnIssueYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnIssueYouFollow',
    defaultMessage:
      '{officialName} gave an official update on an issue you follow',
  },
  officialFeedbackOnQuestionYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnQuestionYouFollow',
    defaultMessage:
      '{officialName} gave an official update on a question you follow',
  },
  officialFeedbackOnContributionYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnContributionYouFollow',
    defaultMessage:
      '{officialName} gave an official update on a contribution you follow',
  },
  officialFeedbackOnInitiativeYouFollow: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnInitiativeYouFollow',
    defaultMessage:
      '{officialName} gave an official update on an initiative you follow',
  },
  mentionInOfficialFeedback: {
    id: 'app.containers.NotificationMenu.mentionInOfficialFeedback',
    defaultMessage: '{officialName} mentioned you in an official update',
  },
  projectPhaseStarted: {
    id: 'app.containers.NotificationMenu.projectPhaseStarted',
    defaultMessage: '{projectTitle} entered a new phase',
  },
  projectPhaseUpcoming: {
    id: 'app.containers.NotificationMenu.projectPhaseUpcoming',
    defaultMessage: '{projectTitle} will enter a new phase on {phaseStartAt}',
  },
  projectPublished: {
    id: 'app.containers.NotificationMenu.projectPublished',
    defaultMessage: 'A new project was published',
  },
  postAssignedToYou: {
    id: 'app.containers.NotificationMenu.postAssignedToYou',
    defaultMessage: '{postTitle} was assigned to you',
  },
  xAssignedPostToYou: {
    id: 'app.containers.NotificationMenu.xAssignedPostToYou',
    defaultMessage: '{name} assigned {postTitle} to you',
  },
  votingBasketSubmitted: {
    id: 'app.containers.NotificationMenu.votingBasketSubmitted',
    defaultMessage: 'You voted successfully',
  },
  votingBasketNotSubmitted: {
    id: 'app.containers.NotificationMenu.votingBasketNotSubmitted',
    defaultMessage: "You didn't submit your votes",
  },
  votingLastChance: {
    id: 'app.containers.NotificationMenu.votingLastChance',
    defaultMessage: 'Last chance to vote for {phaseTitle}',
  },
  votingResults: {
    id: 'app.containers.NotificationMenu.votingResults',
    defaultMessage: '{phaseTitle} vote results revealed',
  },
});
