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
  statusChangedOfIdea: {
    id: 'app.containers.NotificationMenu.statusChangedOfIdea',
    defaultMessage: '{ideaTitle} status has changed to {status}',
  },
  statusChangeOnReactedIdea: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedIdea',
    defaultMessage: 'The status of an idea you reacted to changed to {status}',
  },
  statusChangeOnCommentedIdea: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedIdea',
    defaultMessage:
      'The status of an idea you commented on changed to {status}',
  },
  statusChangeOnReactedProject: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedProject',
    defaultMessage:
      'The status of a project you reacted to changed to {status}',
  },
  statusChangeOnCommentedProject: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedProject',
    defaultMessage:
      'The status of a project you commented on changed to {status}',
  },
  statusChangeOnReactedOption: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedOption',
    defaultMessage:
      'The status of an option you reacted to changed to {status}',
  },
  statusChangeOnCommentedOption: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedOption',
    defaultMessage:
      'The status of an option you commented on changed to {status}',
  },
  statusChangeOnReactedIssue: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedIssue',
    defaultMessage: 'The status of an issue you reacted to changed to {status}',
  },
  statusChangeOnCommentedIssue: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedIssue',
    defaultMessage:
      'The status of an issue you commented on changed to {status}',
  },
  statusChangeOnReactedQuestion: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedQuestion',
    defaultMessage:
      'The status of a question you reacted to changed to {status}',
  },
  statusChangeOnCommentedQuestion: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedQuestion',
    defaultMessage:
      'The status of a question you commented on changed to {status}',
  },
  statusChangeOnReactedContribution: {
    id: 'app.containers.NotificationMenu.statusChangeOnReactedContribution',
    defaultMessage:
      'The status of a contribution you reacted to changed to {status}',
  },
  statusChangeOnCommentedContribution: {
    id: 'app.containers.NotificationMenu.statusChangeOnCommentedContribution',
    defaultMessage:
      'The status of a contribution you commented on changed to {status}',
  },
  statusChangedOfInitiative: {
    id: 'app.containers.NotificationMenu.statusChangedOfInitiative',
    defaultMessage: '{initiativeTitle} status has changed to {status}',
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
  officialFeedbackOnYourIdea2: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourIdea2',
    defaultMessage: '{officialName} gave an official update on your idea',
  },
  officialFeedbackOnReactedIdea: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedIdea',
    defaultMessage:
      '{officialName} gave an official update on an idea you reacted to',
  },
  officialFeedbackOnCommentedIdea: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedIdea',
    defaultMessage:
      '{officialName} gave an official update on an idea you commented on',
  },
  officialFeedbackOnYourProject: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourProject',
    defaultMessage: '{officialName} gave an official update on your project',
  },
  officialFeedbackOnReactedProject: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedProject',
    defaultMessage:
      '{officialName} gave an official update on a project you reacted to',
  },
  officialFeedbackOnCommentedProject: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedProject',
    defaultMessage:
      '{officialName} gave an official update on a project you commented on',
  },
  officialFeedbackOnYourOption: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourOption',
    defaultMessage: '{officialName} gave an official update on your option',
  },
  officialFeedbackOnReactedOption: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedOption',
    defaultMessage:
      '{officialName} gave an official update on an option you reacted to',
  },
  officialFeedbackOnCommentedOption: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedOption',
    defaultMessage:
      '{officialName} gave an official update on an option you commented on',
  },
  officialFeedbackOnYourIssue: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourIssue',
    defaultMessage: '{officialName} gave an official update on your issue',
  },
  officialFeedbackOnReactedIssue: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedIssue',
    defaultMessage:
      '{officialName} gave an official update on an issue you reacted to',
  },
  officialFeedbackOnCommentedIssue: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedIssue',
    defaultMessage:
      '{officialName} gave an official update on an issue you commented on',
  },
  officialFeedbackOnYourQuestion: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourQuestion',
    defaultMessage: '{officialName} gave an official update on your question',
  },
  officialFeedbackOnReactedQuestion: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedQuestion',
    defaultMessage:
      '{officialName} gave an official update on a question you reacted to',
  },
  officialFeedbackOnCommentedQuestion: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedQuestion',
    defaultMessage:
      '{officialName} gave an official update on a question you commented on',
  },
  officialFeedbackOnYourContribution: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourContribution',
    defaultMessage:
      '{officialName} gave an official update on your contribution',
  },
  officialFeedbackOnReactedContribution: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnReactedContribution',
    defaultMessage:
      '{officialName} gave an official update on a contribution you reacted to',
  },
  officialFeedbackOnCommentedContribution: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnCommentedContribution',
    defaultMessage:
      '{officialName} gave an official update on a contribution you commented on',
  },
  officialFeedbackOnYourInitiative: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnYourInitiative',
    defaultMessage: '{officialName} gave an official update on {initiative}',
  },
  officialFeedbackOnVotedInitiative: {
    id: 'app.containers.NotificationMenu.officialFeedbackOnVotedInitiative',
    defaultMessage:
      '{officialName} gave an official update on an initiative you voted for',
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
