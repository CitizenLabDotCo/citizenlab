import { defineMessages } from 'react-intl';

export default defineMessages({
  downloadExcelTemplate: {
    id: 'app.components.FormSync.downloadExcelTemplate',
    defaultMessage: 'Download an Excel template',
  },
  downloadPDF: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.downloadPDF',
    defaultMessage: 'Download as pdf',
  },
  downloadExcelTemplateTooltip: {
    id: 'app.components.admin.ProjectEdit.survey.downloadExcelTemplateTooltip',
    defaultMessage:
      'Excel templates will not include any mapping input questions as these are not supported for bulk importing at this time.',
  },
});
