import { defineMessages } from 'react-intl';

export default defineMessages({
  errorTitle: {
    id: 'app.components.HookForm.Feedback.errorTitle',
    defaultMessage: 'There is a problem',
  },
  submissionErrorTitle: {
    id: 'app.components.HookForm.Feedback.submissionErrorTitle',
    defaultMessage: 'There was a problem on our end, sorry',
  },
  submissionErrorText: {
    id: 'app.components.HookForm.Feedback.submissionError',
    defaultMessage: 'Try again. If the issue persists, contact us',
  },
  successMessage: {
    id: 'app.components.HookForm.Feedback.successMessage',
    defaultMessage: 'Form successfully submitted',
  },
});
