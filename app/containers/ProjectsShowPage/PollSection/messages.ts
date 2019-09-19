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
    defaultMessage: 'The poll is no longer available, since this project is no longer active.',
  },
  pollDisabledNotPermitted: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotPermitted',
    defaultMessage: 'Unfortunately, you don\'t have the rights to take this poll.',
  },
  pollDisabledMaybeNotPermitted: {
    id: 'app.containers.Projects.PollForm.pollDisabledMaybeNotPermitted',
    defaultMessage: 'Only certain users can take this poll. Please sign in first.',
  },
  pollDisabledNotPossible: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotPossible',
    defaultMessage: 'It is currently impossible to take this poll.',
  },
  pollDisabledNotActivePhase: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotActivePhase',
    defaultMessage: 'This survey can only be taken when this phase in the timeline is active.',
  },
  signUpToTakePoll: {
    id: 'app.containers.Projects.PollForm.signUpToTakePoll',
    defaultMessage: 'Please sign up to take this poll',
  },
});
