import { defineMessages } from 'react-intl';

export default defineMessages({
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.BuilderTitle',
    defaultMessage: 'Survey',
  },
  surveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.surveyDescription',
    defaultMessage: "Create and edit the questions in this projects's survey.",
  },
  downloadAllResults: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.downloadAllResults',
    defaultMessage: 'Download all survey results',
  },
  totalSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.totalSurveyResponses',
    defaultMessage: 'Total {count} responses',
  },
  noSurveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.noSurveyResponses',
    defaultMessage: 'No survey responses yet',
  },
  surveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.surveyResults',
    defaultMessage: 'Survey results',
  },
  downloadResults: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.downloadResults',
    defaultMessage: 'Download survey results',
  },
  informationText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.informationText',
    defaultMessage:
      'Responses to short and long answer questions are currently only available in the survey download',
  },
  required: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.required',
    defaultMessage: 'Required',
  },
  optional: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.optional',
    defaultMessage: 'Optional',
  },
  choiceCount: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.choiceCount',
    defaultMessage:
      '{percentage}% ({choiceCount, plural, no {# choices} one {# choice} other {# choices}})',
  },
  // DeleteFormResultsNotice
  openForResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.openForResponses',
    defaultMessage: 'Open for responses',
  },
  deleteSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.deleteSurveyResults',
    defaultMessage: 'Delete survey results',
  },
  viewSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.viewSurveyResults',
    defaultMessage: 'View survey results ({count})',
  },
  editSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.editSurveyContent',
    defaultMessage: 'Edit survey content',
  },
  viewSurveyText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.viewSurveyText',
    defaultMessage: 'View survey',
  },
  deleteResultsConfirmationQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.deleteSurveyResultsConfirmation',
    defaultMessage: 'Are you sure you want to delete all survey results?',
  },
  deleteResultsInfo: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.deleteResultsInfo',
    defaultMessage: 'This cannot be undone',
  },
  cancelDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.cancelDeleteButtonText',
    defaultMessage: 'Cancel',
  },
  confirmDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.confirmDeleteButtonText',
    defaultMessage: 'Yes, delete survey results',
  },
  disabledSurveyMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.disabledSurveyMessage',
    defaultMessage:
      "Survey content can't be edited as survey results have started coming in.",
  },
  deleteResultsLink: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.deleteResultsLink',
    defaultMessage: 'Delete the results if you need to make changes.',
  },
  viewSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.viewSurvey',
    defaultMessage: 'View survey',
  },
  addSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.addSurveyContent',
    defaultMessage: 'Add survey content',
  },
  successMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.successMessage',
    defaultMessage: 'Survey successfully saved',
  },
  supportArticleLink: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.supportArticleLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/6673873-creating-an-in-platform-survey',
  },
  surveyEnd: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.formBuilder.surveyEnd',
    defaultMessage: 'Survey end',
  },
  questionLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.questionLogicHelperText',
    defaultMessage:
      'If no logic is added to an answer, the survey will follow its normal flow. Adding logic to a question will make it required by default. For more information, visit {supportPageLink}',
  },
  pagesLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.pagesLogicHelperText',
    defaultMessage:
      'If no logic is added, the survey will follow its normal flow. For more information, visit {supportPageLink}',
  },
  multiselect: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.multiselectText',
    defaultMessage: 'Multiple choice - choose many',
  },
  select: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.selectText',
    defaultMessage: 'Multiple choice - choose one',
  },
  linear_scale: {
    id: 'app.containers.AdminPage.ProjectEdit.nativeSurvey.linear_scale',
    defaultMessage: 'Linear scale',
  },
});
