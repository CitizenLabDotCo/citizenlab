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
  submissionErrorMessage: {
    id: 'app.components.HookForm.Feedback.submissionErrorMessage',
    defaultMessage:
      'Please try again. If the issue persists, please contact us.',
  },
  successMessage: {
    id: 'app.components.HookForm.Feedback.successMessage',
    defaultMessage: 'Form successfully submitted',
  },
});
