import { defineMessages } from 'react-intl';

export default defineMessages({
  publicAnswers: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.publicAnswers',
    defaultMessage: 'Public answers',
  },
  publicAnswersDescription: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.publicAnswersDescription',
    defaultMessage: 'Responses are shown to all participants.',
  },
  confirmTitle: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.confirmTitle',
    defaultMessage: 'Show answers already collected',
  },
  confirmExplanation: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.confirmExplanation',
    defaultMessage:
      'Participants answered this question while it was private. Turning this on also shows those answers, not only the ones given from now on.',
  },
  cancel: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.cancel',
    defaultMessage: 'Cancel',
  },
  confirm: {
    id: 'app.components.FormBuilder.components.AnswerVisibilityToggle.confirm',
    defaultMessage: 'Show the answers',
  },
});
