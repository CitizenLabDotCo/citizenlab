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
    id: 'app.components.FormSync.downloadExcelTemplateTooltip3',
    defaultMessage:
      'Excel templates will not include File upload questions and any mapping input questions (Drop Pin, Draw Route, Draw Area, ESRI file upload) as these are not supported for bulk importing at this time.',
  },
});
