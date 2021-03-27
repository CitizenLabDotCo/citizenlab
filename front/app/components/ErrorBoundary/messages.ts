import { defineMessages } from 'react-intl';

export default defineMessages({
  genericErrorWithForm: {
    id: 'app.components.ErrorBoundary.genericErrorWithForm',
    defaultMessage:
      'An error occured and we cannot display this content. Please try again, or {openForm}!',
  },
  openFormText: {
    id: 'app.components.ErrorBoundary.openFormText',
    defaultMessage: 'help us figure it out',
  },
  errorFormTitle: {
    id: 'app.components.ErrorBoundary.errorFormTitle',
    defaultMessage: 'It looks like we’re having issues.',
  },
  errorFormSubtitle: {
    id: 'app.components.ErrorBoundary.errorFormSubtitle',
    defaultMessage: 'Our team has been notified.',
  },
  errorFormSubtitle2: {
    id: 'app.components.ErrorBoundary.errorFormSubtitle2',
    defaultMessage: 'If you’d like to help, tell us what happened below.',
  },
  errorFormLabelName: {
    id: 'app.components.ErrorBoundary.errorFormLabelName',
    defaultMessage: 'Name',
  },
  errorFormLabelEmail: {
    id: 'app.components.ErrorBoundary.errorFormLabelEmail',
    defaultMessage: 'Email',
  },
  errorFormLabelComments: {
    id: 'app.components.ErrorBoundary.errorFormLabelComments',
    defaultMessage: 'What happened?',
  },
  errorFormLabelClose: {
    id: 'app.components.ErrorBoundary.errorFormLabelClose',
    defaultMessage: 'Close',
  },
  errorFormLabelSubmit: {
    id: 'app.components.ErrorBoundary.errorFormLabelSubmit',
    defaultMessage: 'Submit',
  },
  errorFormErrorGeneric: {
    id: 'app.components.ErrorBoundary.errorFormErrorGeneric',
    defaultMessage:
      'An unknown error occurred while submitting your report. Please try again.',
  },
  errorFormErrorFormEntry: {
    id: 'app.components.ErrorBoundary.errorFormErrorFormEntry',
    defaultMessage:
      'Some fields were invalid. Please correct the errors and try again.',
  },
  errorFormSuccessMessage: {
    id: 'app.components.ErrorBoundary.errorFormSuccessMessage',
    defaultMessage: 'Your feedback has been sent. Thank you!',
  },
});
