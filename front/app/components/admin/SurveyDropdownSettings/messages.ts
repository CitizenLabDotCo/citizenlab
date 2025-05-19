import { defineMessages } from 'react-intl';

export default defineMessages({
  duplicateAnotherSurvey: {
    id: 'app.components.admin.ProjectEdit.survey.duplicateAnotherSurvey',
    defaultMessage: 'Duplicate another survey',
  },
  downloadSurvey: {
    id: 'app.components.admin.ProjectEdit.survey.downloadSurvey',
    defaultMessage: 'Download survey as pdf',
  },
  downloadExcelTemplate: {
    id: 'app.components.admin.ProjectEdit.survey.downloadExcelTemplate',
    defaultMessage: 'Download an Excel template',
  },
  downloadExcelTemplateTooltip: {
    id: 'app.components.admin.ProjectEdit.survey.downloadExcelTemplateTooltip',
    defaultMessage:
      'Excel templates will not include any mapping input questions as these are not supported for bulk importing at this time.',
  },
  downloadResults: {
    id: 'app.components.admin.ProjectEdit.survey.downloadResults2',
    defaultMessage: 'Download survey results',
  },
  deleteSurveyResults: {
    id: 'app.components.admin.ProjectEdit.survey.deleteSurveyResults2',
    defaultMessage: 'Delete survey results',
  },
});
