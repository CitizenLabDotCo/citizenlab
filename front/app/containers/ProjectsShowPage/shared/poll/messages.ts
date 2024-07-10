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
  pollDisabledNotPossible: {
    id: 'app.containers.Projects.PollForm.pollDisabledNotPossible',
    defaultMessage: 'It is currently impossible to take this poll.',
  },
  maxOptions: {
    id: 'app.containers.Projects.PollForm.maxOptions',
    defaultMessage: 'max. {maxNumber}',
  },
});
