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
  emptyTitleMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.emptyTitleErrorMessage',
    defaultMessage: 'Provide a question title',
  },
  errorMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.errorMessage',
    defaultMessage:
      'There is a problem, please fix the issue to be able to save your changes',
  },
});
