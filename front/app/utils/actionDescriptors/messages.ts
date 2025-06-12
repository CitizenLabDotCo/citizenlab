import { defineMessages } from 'react-intl';

export default defineMessages({
  // Defaults
  defaultNotInGroup: {
    id: 'app.utils.notInGroup',
    defaultMessage: 'You do not meet the requirements to participate.',
  },

  // 'posting_idea'
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

  // 'commenting_idea'
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

  // 'reacting_idea'
  reactingDisabledProjectInactive: {
    id: 'app.components.ReactionControl.reactingDisabledProjectInactive',
    defaultMessage: 'You can no longer react to ideas in {projectName}',
  },
  reactingDisabledPhaseOver: {
    id: 'app.components.ReactionControl.reactingDisabledPhaseOver',
    defaultMessage: "It's no longer possible to react in this phase",
  },
  reactingDisabledFutureEnabled: {
    id: 'app.components.ReactionControl.reactingDisabledFutureEnabled',
    defaultMessage: 'Reacting will be enabled once this phase starts',
  },
  reactingPossibleLater: {
    id: 'app.components.ReactionControl.reactingPossibleLater',
    defaultMessage: 'Reacting will start on {enabledFromDate}',
  },
  reactingNotEnabled: {
    id: 'app.components.ReactionControl.reactingNotEnabled',
    defaultMessage: 'Reacting is currently not enabled for this project',
  },
  reactingNotSignedIn: {
    id: 'app.components.ReactionControl.reactingNotSignedIn',
    defaultMessage: 'Sign in to react.',
  },
  likingDisabledMaxReached: {
    id: 'app.components.ReactionControl.likingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of likes in {projectName}",
  },
  dislikingDisabledMaxReached: {
    id: 'app.components.ReactionControl.dislikingDisabledMaxReached',
    defaultMessage:
      "You've reached your maximum number of dislikes in {projectName}",
  },
  reactingNotPermitted: {
    id: 'app.components.ReactionControl.reactingNotPermitted',
    defaultMessage: 'Reacting is only enabled for certain groups',
  },
  completeProfileToReact: {
    id: 'app.components.ReactionControl.completeProfileToReact',
    defaultMessage: 'Complete your profile to react',
  },
  reactingVerifyToReact: {
    id: 'app.components.ReactionControl.reactingVerifyToReact',
    defaultMessage: 'Verify your identity in order to react.',
  },

  // 'voting'
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
  votingDisabledProjectInactive: {
    id: 'app.utils.participationMethodConfig.voting.votingDisabledProjectInactive',
    defaultMessage:
      'Voting is no longer available, since this phase is no longer active.',
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
  documentAnnotationDisabledProjectInactive: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledProjectInactive',
    defaultMessage:
      'The document is no longer available, since this project is no longer active.',
  },
  documentAnnotationDisabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotPermitted',
    defaultMessage:
      "Unfortunately, you don't have the rights to review this document.",
  },
  documentAnnotationDisabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledMaybeNotPermitted',
    defaultMessage:
      'Only certain users can review this document. Please {signUpLink} or {logInLink} first.',
  },
  documentAnnotationDisabledNotActiveUser: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to review the document.',
  },
  documentAnnotationDisabledNotActivePhase: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotActivePhase1',
    defaultMessage:
      'This document can only be reviewed when this phase is active.',
  },
  documentAnnotationDisabledNotVerified: {
    id: 'app.containers.ProjectsShowPage.shared.document_annotation.documentAnnotationDisabledNotVerified',
    defaultMessage:
      'Reviewing this document requires verification of your account. {verificationLink}',
  },

  // 'taking_survey'
  surveyDisabledProjectInactive: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledProjectInactive2',
    defaultMessage:
      'The survey is no longer available, since this project is no longer active.',
  },
  surveyDisabledNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotPermitted',
    defaultMessage:
      "Unfortunately, you don't have the rights to take this survey.",
  },
  surveyDisabledMaybeNotPermitted: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledMaybeNotPermitted',
    defaultMessage:
      'Only certain users can take this survey. Please {signUpLink} or {logInLink} first.',
  },
  surveyDisabledNotActiveUser: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to take the survey.',
  },
  surveyDisabledNotActivePhase: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotActivePhase',
    defaultMessage:
      'This survey can only be taken when this phase in the timeline is active.',
  },
  surveyDisabledNotVerified: {
    id: 'app.containers.ProjectsShowPage.process.survey.surveyDisabledNotVerified',
    defaultMessage:
      'Taking this survey requires verification of your account. {verificationLink}',
  },

  // 'taking_poll'
  pollDisabledProjectInactive: {
    id: 'app.containers.Projects.PollForm.pollDisabledProjectInactive',
    defaultMessage:
      'The poll is no longer available, since this project is no longer active.',
  },
  pollDisabledNotPermitted: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotPermitted',
    defaultMessage:
      "Unfortunately, you don't have the rights to take this poll.",
  },
  pollDisabledNotActivePhase: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotActivePhase1',
    defaultMessage: 'This poll can only be taken when this phase is active.',
  },
  pollDisabledAlreadyResponded: {
    id: 'app.containers.Projects.PollForm.pollDisabledAlreadyResponded',
    defaultMessage: "You've already taken this poll.",
  },

  // 'attending_event'
  attendingEventNotSignedIn: {
    id: 'app.utils.actionDescriptors.attendingEventNotSignedIn',
    defaultMessage: 'You must log in or register to attend this event.',
  },
  attendingEventNotPermitted: {
    id: 'app.utils.actionDescriptors.attendingEventNotPermitted',
    defaultMessage: 'You are not permitted to attend this event.',
  },
  attendingEventNotInGroup: {
    id: 'app.utils.actionDescriptors.attendingEventNotInGroup',
    defaultMessage: 'You do not meet the requirements to attend this event.',
  },
  attendingEventNotVerified: {
    id: 'app.utils.actionDescriptors.attendingEventNotVerified',
    defaultMessage:
      'You must verify your account before you can attend this event.',
  },
  attendingEventMissingRequirements: {
    id: 'app.utils.actionDescriptors.attendingEventMissingRequirements',
    defaultMessage: 'You must complete your profile to attend this event.',
  },

  // volunteering
  volunteeringNotSignedIn: {
    id: 'app.utils.actionDescriptors.volunteeringNotSignedIn',
    defaultMessage: 'You must log in or register to volunteer.',
  },
  volunteeringNotActiveUser: {
    id: 'app.utils.actionDescriptors.volunteeringdNotActiveUser',
    defaultMessage: 'Please {completeRegistrationLink} to volunteer.',
  },
  volunteeringNotVerified: {
    id: 'app.utils.actionDescriptors.volunteeringNotVerified',
    defaultMessage: 'You must verify your account before you can volunteer.',
  },
  volunteeringMissingRequirements: {
    id: 'app.utils.actionDescriptors.volunteeringMissingRequirements',
    defaultMessage: 'You must complete your profile to volunteer.',
  },
  volunteeringNotPermitted: {
    id: 'app.utils.actionDescriptors.volunteeringNotPermitted',
    defaultMessage: 'You are not permitted to volunteer.',
  },
  volunteeringNotInGroup: {
    id: 'app.utils.actionDescriptors.volunteeringNotInGroup',
    defaultMessage: 'You do not meet the requirements to volunteer.',
  },
});
