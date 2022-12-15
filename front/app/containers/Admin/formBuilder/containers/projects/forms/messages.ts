import { defineMessages } from 'react-intl';

export default defineMessages({
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyText',
    defaultMessage: 'Survey',
  },
  surveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyDescription',
    defaultMessage: "Create and edit the questions in this projects's survey.",
  },
  emptyTitleError: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.emptyTitleError',
    defaultMessage: 'Provide a question title',
  },
  errorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.errorMessage',
    defaultMessage:
      'There is a problem, please fix the issue to be able to save your changes',
  },
  emptyOptionError: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.emptyOptionError',
    defaultMessage: 'Provide at least 1 answer',
  },
  successMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.successMessage',
    defaultMessage: 'Survey successfully saved',
  },
  downloadAllResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadAllResults',
    defaultMessage: 'Download all survey results',
  },
});
