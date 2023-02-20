import { defineMessages } from 'react-intl';

export default defineMessages({
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.BuilderTitle',
    defaultMessage: 'Survey',
  },
  surveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyDescription',
    defaultMessage: "Create and edit the questions in this projects's survey.",
  },
  downloadAllResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadAllResults',
    defaultMessage: 'Download all survey results',
  },
  totalSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.totalSurveyResponses',
    defaultMessage: 'Total {count} responses',
  },
  noSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.noSurveyResponses',
    defaultMessage: 'No survey responses yet',
  },
  surveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyResults',
    defaultMessage: 'Survey results',
  },
  downloadResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadResults',
    defaultMessage: 'Download survey results',
  },
  informationText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.informationText',
    defaultMessage:
      'Responses to short and long answer questions are currently only available in the survey download',
  },
  required: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.required',
    defaultMessage: 'Required',
  },
  optional: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.optional',
    defaultMessage: 'Optional',
  },
  choiceCount: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.choiceCount',
    defaultMessage:
      '{percentage}% ({choiceCount, plural, no {# choices} one {# choice} other {# choices}})',
  },
  // DeleteFormResultsNotice
  openForResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.openForResponses',
    defaultMessage: 'Open for responses',
  },
  deleteSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteSurveyResults',
    defaultMessage: 'Delete survey results',
  },
  viewSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurveyResults',
    defaultMessage: 'View survey results ({count})',
  },
  editSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.editSurveyContent',
    defaultMessage: 'Edit survey content',
  },
  viewSurveyText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurveyText',
    defaultMessage: 'View survey',
  },
  deleteResultsConfirmationQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteSurveyResultsConfirmation',
    defaultMessage: 'Are you sure you want to delete all survey results?',
  },
  deleteResultsInfo: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteResultsInfo',
    defaultMessage: 'This cannot be undone',
  },
  cancelDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.cancelDeleteButtonText',
    defaultMessage: 'Cancel',
  },
  confirmDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.confirmDeleteButtonText',
    defaultMessage: 'Yes, delete survey results',
  },
  disabledSurveyMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.disabledSurveyMessage',
    defaultMessage:
      "Survey content can't be edited as survey results have started coming in.",
  },
  deleteResultsLink: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteResultsLink',
    defaultMessage: 'Delete the results if you need to make changes.',
  },
  viewSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurvey',
    defaultMessage: 'View survey',
  },
  addSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.addSurveyContent',
    defaultMessage: 'Add survey content',
  },
  successMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.successMessage',
    defaultMessage: 'Survey successfully saved',
  },
  supportArticleLink: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.supportArticleLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/6673873-creating-an-in-platform-survey',
  },
  surveyEnd: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.surveyEnd',
    defaultMessage: 'Survey end',
  },
  questionLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.questionLogicHelperText',
    defaultMessage:
      'If no logic is added to an answer, the survey will follow its normal flow. Adding logic to a question will make it required by default. For more information, visit {supportPageLink}',
  },
  pagesLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.pagesLogicHelperText',
    defaultMessage:
      'If no logic is added, the survey will follow its normal flow. For more information, visit {supportPageLink}',
  },
  multiselect: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.multiselectText',
    defaultMessage: 'Multiple choice - choose many',
  },
  select: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.selectText',
    defaultMessage: 'Multiple choice - choose one',
  },
  linear_scale: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.linear_scale',
    defaultMessage: 'Linear scale',
  },
});
