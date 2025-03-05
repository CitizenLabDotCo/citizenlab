import { defineMessages } from 'react-intl';

export default defineMessages({
  survey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.survey2',
    defaultMessage: 'Survey',
  },
  surveyDescription: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyDescription2',
    defaultMessage: "Create and edit the questions in this projects's survey.",
  },
  downloadAllResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadAllResults2',
    defaultMessage: 'Download all survey results',
  },
  surveyResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.surveyResponses',
    defaultMessage: 'Survey responses',
  },
  downloadResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadResults2',
    defaultMessage: 'Download survey results',
  },
  downloadSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadSurvey',
    defaultMessage: 'Download survey as pdf',
  },
  downloadExcelTemplateTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadExcelTemplateTooltip',
    defaultMessage:
      'Excel templates will not include any mapping input questions as these are not supported for bulk importing at this time.',
  },
  informationText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.informationText3',
    defaultMessage:
      'AI summaries of short and long answer questions can be accessed from the AI tab in the left sidebar.',
  },
  openForResponses: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.openForResponses2',
    defaultMessage: 'Open for responses',
  },
  deleteSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteSurveyResults2',
    defaultMessage: 'Delete survey results',
  },
  viewSurveyResults: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurveyResults2',
    defaultMessage: 'View survey results ({count})',
  },
  editSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.editSurveyContent2',
    defaultMessage: 'Edit survey content',
  },
  editSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.editSurvey1',
    defaultMessage: 'Edit',
  },
  viewSurveyText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurveyText',
    defaultMessage: 'View',
  },
  existingSubmissionsWarning: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.existingSubmissionsWarning',
    defaultMessage:
      'Submissions to this survey have started to come in. Changes to the survey may result in data loss and incomplete data in the exported files.',
  },
  deleteResultsConfirmationQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteSurveyResultsConfirmation2',
    defaultMessage: 'Are you sure you want to delete all survey results?',
  },
  deleteResultsInfo: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteResultsInfo2',
    defaultMessage: 'This cannot be undone',
  },
  cancelDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.cancelDeleteButtonText2',
    defaultMessage: 'Cancel',
  },
  confirmDeleteButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.confirmDeleteButtonText2',
    defaultMessage: 'Yes, delete survey results',
  },
  disabledSurveyMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.disabledSurveyMessage2',
    defaultMessage:
      "Survey content can't be edited as survey results have started coming in.",
  },
  deleteResultsLink: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.deleteResultsLink2',
    defaultMessage: 'Delete the results if you need to make changes.',
  },
  viewSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.viewSurvey2',
    defaultMessage: 'View survey',
  },
  addSurveyContent: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.addSurveyContent2',
    defaultMessage: 'Add survey content',
  },
  successMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.successMessage2',
    defaultMessage: 'Survey successfully saved',
  },
  supportArticleLink: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.supportArticleLink2',
    defaultMessage:
      'https://support.govocal.com/en/articles/6673873-creating-an-in-platform-survey',
  },
  surveyEnd: {
    id: 'app.containers.AdminPage.ProjectEdit.formBuilder.surveyEnd2',
    defaultMessage: 'Survey end',
  },
  pagesLogicHelperText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.pagesLogicHelperText1',
    defaultMessage:
      'If no logic is added, the survey will follow its normal flow. If both the page and its questions have logic, the question logic will take precedence. Ensure this aligns with your intended survey flow. For more information, visit {supportPageLink}',
  },
  ranking: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.ranking2',
    defaultMessage: 'Ranking',
  },
  matrix_linear_scale: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.matrix_linear_scale2',
    defaultMessage: 'Matrix',
  },
  multiselect: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.multiselectText2',
    defaultMessage: 'Multiple choice - choose many',
  },
  select: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.selectText2',
    defaultMessage: 'Multiple choice - choose one',
  },
  linear_scale: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.linear_scale2',
    defaultMessage: 'Linear scale',
  },
  rating: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.rating',
    defaultMessage: 'Rating',
  },
  multiline_text: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.multiline_text2',
    defaultMessage: 'Long answer',
  },
  text: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.text2',
    defaultMessage: 'Short answer',
  },
  multiselect_image: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.multiselect_image',
    defaultMessage: 'Image choice - choose many',
  },
  point: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.point',
    defaultMessage: 'Location',
  },
  file_upload: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.file_upload',
    defaultMessage: 'File upload',
  },
  shapefile_upload: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.shapefile_upload',
    defaultMessage: 'Esri shapefile upload',
  },
  downloadExcelTemplate: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.downloadExcelTemplate',
    defaultMessage: 'Download an Excel template',
  },
  importInputs: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.importInputs',
    defaultMessage: 'Import',
  },
  duplicateAnotherSurvey: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.duplicateAnotherSurvey',
    defaultMessage: 'Duplicate another survey',
  },
});
