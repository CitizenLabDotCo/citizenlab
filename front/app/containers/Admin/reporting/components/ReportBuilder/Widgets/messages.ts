import { defineMessages } from 'react-intl';

export default defineMessages({
  noProject: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.noProject',
    defaultMessage: 'No project',
  },
  noAppropriatePhases: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.noAppropriatePhases',
    defaultMessage: 'No appropriate phases found in this project',
  },
  noProjectSelected: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.noProjectSelected',
    defaultMessage: 'No project selected. Please select a project first.',
  },
  noPhaseSelected: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.noPhaseSelected',
    defaultMessage: 'No phase selected. Please select a phase first.',
  },
  // Custom widget titles for global platform report
  visitorsWidgetFromStart: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.visitorsWidgetFromStart',
    defaultMessage: 'Visitor timeline from the start',
  },
  trafficSourcesWidgetFromStart: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.trafficSourcesWidgetFromStart',
    defaultMessage: 'Traffic sources from the start',
  },
  trafficSourcesWidgetLast6Months: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.trafficSourcesWidgetLast6Months',
    defaultMessage: 'Traffic sources last 6 months',
  },
});
