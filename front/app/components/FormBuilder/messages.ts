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
});
