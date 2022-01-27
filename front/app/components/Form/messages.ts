import { defineMessages } from 'react-intl';

export default defineMessages({
  submitApiError: {
    id: 'app.components.form.submitApiError',
    defaultMessage:
      'There was an issue submitting the form. Please check for any errors and try again.',
  },
  submit: {
    id: 'app.components.form.submit',
    defaultMessage: 'Submit',
  },
  error: {
    id: 'app.components.form.error',
    defaultMessage: 'Error',
  },
  locationGoogleUnavailable: {
    id: 'app.components.form.locationGoogleUnavailable',
    defaultMessage: "Couldn't load location field provided by google maps.",
  },
  guidelinesLinkText: {
    id: 'app.components.form.ErrorDisplay.guidelinesLinkText',
    defaultMessage: 'our guidelines',
  },
  userPickerPlaceholder: {
    id: 'app.components.form.ErrorDisplay.userPickerPlaceholder',
    defaultMessage: 'Start typing to search by user email or name...',
  },
});
