import { defineMessages } from 'react-intl';

export default defineMessages({
  errorMessage: {
    id: 'app.components.formBuilder.errorMessage',
    defaultMessage:
      'There is a problem, please fix the issue to be able to save your changes',
  },
  staleDataErrorMessage: {
    id: 'app.components.formBuilder.staleDataErrorMessage2',
    defaultMessage:
      'There has been a problem. This input form has been saved more recently somewhere else. This may be because you or another user has it open for editing in another browser window. Please refresh the page to get the latest form and then make your changes again.',
  },
  unsavedChanges: {
    id: 'app.components.formBuilder.unsavedChanges',
    defaultMessage: 'You have unsaved changes',
  },
});
