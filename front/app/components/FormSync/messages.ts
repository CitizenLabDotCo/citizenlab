import { defineMessages } from 'react-intl';

export default defineMessages({
  downloadExcelTemplate: {
    id: 'app.containers.AdminPage.ProjectIdeaForm.downloadExcelTemplate',
    defaultMessage: 'Download an Excel template',
  },
  downloadExcelTemplateTooltip: {
    id: 'app.components.admin.ProjectEdit.survey.downloadExcelTemplateTooltip',
    defaultMessage:
      'Excel templates will not include any mapping input questions as these are not supported for bulk importing at this time.',
  },
});
