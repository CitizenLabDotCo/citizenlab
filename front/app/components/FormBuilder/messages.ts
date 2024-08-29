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
