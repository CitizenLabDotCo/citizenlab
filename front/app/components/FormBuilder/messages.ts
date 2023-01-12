import { defineMessages } from 'react-intl';

export default defineMessages({
  emptyTitleError: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.emptyTitleError',
    defaultMessage: 'Provide a question title',
  },
  errorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.errorMessage',
    defaultMessage:
      'There is a problem, please fix the issue to be able to save your changes',
  },
  emptyOptionError: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.emptyOptionError',
    defaultMessage: 'Provide at least 1 answer',
  },
  logicValidationError: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.logicValidationError',
    defaultMessage: 'Logic may not link to prior pages',
  },
  page: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.Page',
    defaultMessage: 'Page',
  },
});
