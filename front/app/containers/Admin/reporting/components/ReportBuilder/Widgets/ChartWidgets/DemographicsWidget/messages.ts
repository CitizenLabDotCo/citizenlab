import { defineMessages } from 'react-intl';

export default defineMessages({
  users: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.users',
    defaultMessage: 'Users: {numberOfUsers} ({percentageOfUsers}%)',
  },
  demographics: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.demographics',
    defaultMessage: 'Demographics',
  },
  demographicQuestion: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.demographicQuestion',
    defaultMessage: 'Demographic question',
  },
  unknown: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.unknown',
    defaultMessage: 'Unknown',
  },
  registrationDateRange: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.registrationDateRange',
    defaultMessage: 'Registration date range',
  },
  demographicsTableCaption: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.demographicsTableCaption',
    defaultMessage:
      'Demographics data table showing category, count and percentage of participants',
  },
  categoryColumn: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.categoryColumn',
    defaultMessage: 'Category',
  },
  countColumn: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.countColumn',
    defaultMessage: 'Count',
  },
  participantsColumn: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.participantsColumn',
    defaultMessage: 'Participants %',
  },
});
