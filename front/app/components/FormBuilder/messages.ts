import { defineMessages } from 'react-intl';

export default defineMessages({
  emptyTitleError: {
    id: 'app.components.formBuilder.emptyTitleError',
    defaultMessage: 'Provide a question title',
  },
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
  emptyOptionError: {
    id: 'app.components.formBuilder.emptyOptionError',
    defaultMessage: 'Provide at least 1 answer',
  },
  emptyTitleMessage: {
    id: 'app.components.formBuilder.emptyTitleMessage',
    defaultMessage: 'Provide a title for all the answers',
  },
  emptyImageOptionError: {
    id: 'app.components.formBuilder.emptyImageOptionError',
    defaultMessage:
      'Provide at least 1 answer. Please note that each answer has to have a title.',
  },
  logicValidationError: {
    id: 'app.components.formBuilder.logicValidationError',
    defaultMessage: 'Logic may not link to prior pages',
  },
  page: {
    id: 'app.components.formBuilder.Page',
    defaultMessage: 'Page',
  },
  helmetTitle: {
    id: 'app.components.formBuilder.helmetTitle',
    defaultMessage: 'Form builder',
  },
  unsavedChanges: {
    id: 'app.components.formBuilder.unsavedChanges',
    defaultMessage: 'You have unsaved changes',
  },
});
