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
  userCommentedOnYourIdea: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourIdea',
    defaultMessage: '{name} commented on your idea',
  },
  userCommentedOnYourOption: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourOption',
    defaultMessage: '{name} commented on your option',
  },
  userCommentedOnYourProject: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourProject',
    defaultMessage: '{name} commented on your project',
  },
  userCommentedOnYourQuestion: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourQuestion',
    defaultMessage: '{name} commented on your question',
  },
  userCommentedOnYourIssue: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourIssue',
    defaultMessage: '{name} commented on your issue',
  },
  userCommentedOnYourContribution: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourContribution',
    defaultMessage: '{name} commented on your contribution',
  },
  userCommentedOnYourInitiative: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourInitiative',
    defaultMessage: '{name} commented on your initiative',
  },
  userReactedToYourComment: {
    id: 'app.containers.NotificationMenu.userReactedToYourComment',
    defaultMessage: '{name} reacted to your comment',
  },
  mentionInComment: {
    id: 'app.containers.NotificationMenu.mentionInComment',
    defaultMessage: '{name} mentioned you in a comment',
  },
  userReportedCommentAsSpam: {
    id: 'app.containers.NotificationMenu.userReportedCommentAsSpam',
    defaultMessage: "{name} reported a comment on '{postTitle}' as spam",
  },
  userMarkedPostAsSpam: {
    id: 'app.containers.NotificationMenu.userMarkedPostAsSpam',
    defaultMessage: "{name} reported '{postTitle}' as spam",
  },
  statusChangedOfYourIdea: {
    id: 'app.containers.NotificationMenu.statusChangedOfYourIdea',
    defaultMessage: "'{ideaTitle}' status has changed to {status}",
  },
  statusChangeOnVotedIdea: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedIdea',
    defaultMessage: 'The status of an idea you voted for changed to {status}',
  },
  statusChangeOnCommentedIdea: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedIdea',
    defaultMessage:
      'The status of an idea you commented on changed to {status}',
  },
  statusChangeOnVotedProject: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedProject',
    defaultMessage: 'The status of a project you voted for changed to {status}',
  },
  statusChangeOnCommentedProject: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedProject',
    defaultMessage:
      'The status of a project you commented on changed to {status}',
  },
  statusChangeOnVotedOption: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedOption',
    defaultMessage: 'The status of an option you voted for changed to {status}',
  },
  statusChangeOnCommentedOption: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedOption',
    defaultMessage:
      'The status of an option you commented on changed to {status}',
  },
  statusChangeOnVotedIssue: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedIssue',
    defaultMessage: 'The status of an issue you voted for changed to {status}',
  },
  statusChangeOnCommentedIssue: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedIssue',
    defaultMessage:
      'The status of an issue you commented on changed to {status}',
  },
  statusChangeOnVotedQuestion: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedQuestion',
    defaultMessage:
      'The status of a question you voted for changed to {status}',
  },
  statusChangeOnCommentedQuestion: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedQuestion',
    defaultMessage:
      'The status of a question you commented on changed to {status}',
  },
  statusChangeOnVotedContribution: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedContribution',
    defaultMessage:
      'The status of a contribution you voted for changed to {status}',
  },
  statusChangeOnCommentedContribution: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedContribution',
    defaultMessage:
      'The status of a contribution you commented on changed to {status}',
  },
  statusChangedOfYourInitiative: {
    id: 'app.containers.NotificationMenu.statusChangedOfYourInitiative',
    defaultMessage: "'{initiativeTitle}' status has changed to {status}",
  },
  statusChangeOnVotedInitiative: {
    id: 'app.containers.NotificationMenu.statusChangeOnVotedInitiative',
    defaultMessage:
      'The status of an initiative you voted for changed to {status}',
  },
  statusChangeOnCommentedInitiative: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedInitiative',
    defaultMessage:
      'The status of an initiative you commented on changed to {status}',
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
    id: 'app.containers.NotificationMenu.commentDeletedByAdminFor',
    defaultMessage: `Your comment on '{postTitle}' has been deleted by an admin because
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
  deletedUser: {
    id: 'app.containers.NotificationMenu.deletedUser',
    defaultMessage: 'Deleted user',
  },
  officialFeedbackOnYourIdea: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourIdea',
    defaultMessage: '{officialName} gave an official update on {idea}',
  },
  officialFeedbackOnYourInitiative: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourInitiative',
    defaultMessage: '{officialName} gave an official update on {initiative}',
  },
  officialFeedbackOnVotedIdea: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnVotedIdea',
    defaultMessage:
      '{officialName} gave an official update on an idea you voted for',
  },
  officialFeedbackOnVotedInitiative: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnVotedInitiative',
    defaultMessage:
      '{officialName} gave an official update on an initiative you voted for',
  },
  officialFeedbackOnCommentedIdea: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedIdea',
    defaultMessage:
      '{officialName} gave an official update on an idea you commented on',
  },
  officialFeedbackOnCommentedInitiative: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedInitiative',
    defaultMessage:
      '{officialName} gave an official update on an initiative you commented on',
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
  postAssignedToYou: {
    id: 'app.containers.NotificationMenu.postAssignedToYou',
    defaultMessage: '{postTitle} was assigned to you',
  },
  xAssignedPostToYou: {
    id: 'app.containers.NotificationMenu.xAssignedPostToYou',
    defaultMessage: '{name} assigned {postTitle} to you',
  },
});
