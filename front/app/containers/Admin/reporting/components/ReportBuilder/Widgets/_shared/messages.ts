import { defineMessages } from 'react-intl';

export default defineMessages({
  missingData: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets._shared.missingData',
    defaultMessage:
      'The data for this widget is missing. Reconfigure or delete it to be able to save the report.',
  },
  description: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets._shared.description',
    defaultMessage: 'Description:',
  },
  excludeFolders: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets._shared.excludeFolders',
    defaultMessage: 'Exclude folders',
  },
  excludeProjects: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets._shared.excludeProjects',
    defaultMessage: 'Exclude projects',
  },
});
