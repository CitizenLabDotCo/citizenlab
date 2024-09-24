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
  registrationField: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.registrationField',
    defaultMessage: 'Registration field',
  },
  unknown: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.unknown',
    defaultMessage: 'Unknown',
  },
  registrationDateRange: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.registrationDateRange',
    defaultMessage: 'Registration date range',
  },
  notRepresented: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.Widgets.ChartWidgets.UsersWidget.notRepresented',
    defaultMessage: 'Not Represented',
  },
});
