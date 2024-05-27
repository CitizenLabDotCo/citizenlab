import { defineMessages } from 'react-intl';

export default defineMessages({
  // Defaults
  defaultNotInGroup: {
    id: 'app.utils.notInGroup',
    defaultMessage: 'You do not meet the requirements to participate.',
  },
  postingDisabled: {
    id: 'app.containers.IdeaButton.postingDisabled',
    defaultMessage: 'New submissions are not currently being accepted',
  },
  postingLimitedMaxReached: {
    id: 'app.containers.IdeaButton.postingLimitedMaxReached',
    defaultMessage:
      'You have already completed this survey. Thanks for your response!',
  },
  postingNoPermission: {
    id: 'app.containers.IdeaButton.postingNoPermission',
    defaultMessage: 'New submissions are only enabled for certain groups',
  },
  postingInactive: {
    id: 'app.containers.IdeaButton.postingInactive',
    defaultMessage: 'New submissions are not currently being accepted.',
  },
  postingInNonActivePhases: {
    id: 'app.containers.IdeaButton.postingInNonActivePhases',
    defaultMessage: 'New submissions can only be added in active phases.',
  },
  postingNotYetPossible: {
    id: 'app.containers.IdeaButton.postingNotYetPossible',
    defaultMessage: 'New submissions are not yet accepted here.',
  },
  commentingDisabledInactiveProject: {
    id: 'app.components.Comments.commentingDisabledInactiveProject',
    defaultMessage:
      'Commenting is not possible because this project is currently not active.',
  },
  commentingDisabledProject: {
    id: 'app.components.Comments.commentingDisabledProject',
    defaultMessage: 'Commenting in this project is currently disabled.',
  },
  commentingDisabledInCurrentPhase: {
    id: 'app.components.Comments.commentingDisabledInCurrentPhase',
    defaultMessage: 'Commenting is not possible in the current phase.',
  },
  commentingDisabledUnverified: {
    id: 'app.components.Comments.commentingDisabledUnverified',
    defaultMessage: '{verifyIdentityLink} to comment.',
  },
  commentingMaybeNotPermitted: {
    id: 'app.components.Comments.commentingMaybeNotPermitted',
    defaultMessage:
      'Not all users are allowed to comment. Please {signUpLink} or {signInLink} to see whether you comply.',
  },
  signInToComment: {
    id: 'app.containers.Comments.signInToComment',
    defaultMessage: 'Please {signUpLink} or {signInLink} to comment.',
  },
  completeProfileToComment: {
    id: 'app.containers.Comments.completeProfileToComment',
    defaultMessage: 'Please {completeRegistrationLink} to comment.',
  },
  commentingInitiativeNotPermitted: {
    id: 'app.components.Comments.commentingInitiativeNotPermitted',
    defaultMessage: "You don't have the rights to comment.",
  },
  commentingInitiativeMaybeNotPermitted: {
    id: 'app.components.Comments.commentingInitiativeMaybeNotPermitted',
    defaultMessage:
      'Not all users are allowed to comment. Please {signUpLink} or {signInLink} to see whether you comply.',
  },
  signInToCommentInitiative: {
    id: 'app.containers.Comments.signInToCommentInitiative',
    defaultMessage: 'Please {signUpLink} or {signInLink} to comment.',
  },
  signInAndVerifyToCommentInitiative: {
    id: 'app.containers.Comments.signInAndVerifyToCommentInitiative',
    defaultMessage:
      'You need a verified account to comment, please {signUpLink} or {signInLink}.',
  },
  votingNotSignedIn: {
    id: 'app.utils.participationMethodConfig.voting.votingNotSignedIn2',
    defaultMessage: 'You must log in or register to vote.',
  },
  votingNotPermitted: {
    id: 'app.utils.participationMethodConfig.voting.votingNotPermitted',
    defaultMessage: 'You are not permitted to vote.',
  },
  votingNotInGroup: {
    id: 'app.utils.participationMethodConfig.voting.votingNotInGroup',
    defaultMessage: 'You do not meet the requirements to vote.',
  },
  votingNotVerified: {
    id: 'app.utils.participationMethodConfig.voting.votingNotVerified',
    defaultMessage: 'You must verify your account before you can vote.',
  },
  budgetingNotSignedIn: {
    id: 'app.utils.votingMethodUtils.budgetingNotSignedIn2',
    defaultMessage: 'You must log in or register to assign budgets.',
  },
  budgetingNotPermitted: {
    id: 'app.utils.votingMethodUtils.budgetingNotPermitted',
    defaultMessage: 'You are not permitted to assign budgets.',
  },
  budgetingNotInGroup: {
    id: 'app.utils.votingMethodUtils.budgetingNotInGroup',
    defaultMessage: 'You do not meet the requirements to assign budgets.',
  },
  budgetingNotVerified: {
    id: 'app.utils.votingMethodUtils.budgetingNotVerified',
    defaultMessage:
      'You must verify your account before you can assign budgets.',
  },
});
