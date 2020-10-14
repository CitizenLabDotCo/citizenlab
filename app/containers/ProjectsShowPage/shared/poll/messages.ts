import { defineMessages } from 'react-intl';

export default defineMessages({
  formCompleted: {
    id: 'app.containers.Projects.PollForm.formCompleted',
    defaultMessage: 'Thank you for answering this poll!',
  },
  sendAnswer: {
    id: 'app.containers.Projects.PollForm.sendAnswer',
    defaultMessage: 'Send',
  },
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
  pollDisabledMaybeNotPermitted: {
    id: 'app.containers.Projects.PollForm.pollDisabledMaybeNotPermitted',
    defaultMessage:
      'Only certain users can take this poll. Please {signUpLink} or {logInLink} first.',
  },
  pollDisabledMaybeNotVerified: {
    id: 'app.containers.Projects.PollForm.pollDisabledMaybeNotVerified',
    defaultMessage:
      'Only verified users can take this poll. Please {signUpLink} or {logInLink} first.',
  },
  pollDisabledNotPossible: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotPossible',
    defaultMessage: 'It is currently impossible to take this poll.',
  },
  pollDisabledNotActivePhase: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotActivePhase',
    defaultMessage:
      'This survey can only be taken when this phase in the timeline is active.',
  },
  signUpLinkText: {
    id: 'app.containers.Projects.PollForm.signUpLinkText',
    defaultMessage: 'sign up',
  },
  logInLinkText: {
    id: 'app.containers.Projects.PollForm.logInLinkText',
    defaultMessage: 'log in',
  },
  verificationLinkText: {
    id: 'app.containers.Projects.PollForm.verificationLinkText',
    defaultMessage: 'Verify your account now.',
  },
  pollDisabledNotVerified: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotVerified',
    defaultMessage:
      'Taking this poll requires verification of your account. {verificationLink}',
  },
  maxOptions: {
    id: 'app.containers.Projects.PollForm.maxOptions',
    defaultMessage: 'max. {maxNumber}',
  },
});
