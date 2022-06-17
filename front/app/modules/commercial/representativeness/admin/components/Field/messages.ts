import { defineMessages } from 'react-intl';

export default defineMessages({
  defaultField: {
    id: 'app.containers.AdminPage.DashboardPage.components.Field.defaultField',
    defaultMessage: 'Default field',
  },
  baseMonth: {
    id: 'app.containers.AdminPage.DashboardPage.components.Field.baseMonth',
    defaultMessage: 'Base month (optional)',
  },
  options: {
    id: 'app.containers.AdminPage.DashboardPage.components.Field.options',
    defaultMessage: 'Options',
  },
  numberOfTotalResidents: {
    id: 'app.containers.AdminPage.DashboardPage.components.Field.numberOfTotalResidents',
    defaultMessage: 'Number of total residents',
  },
  disallowSaveMessage: {
    id: 'app.containers.AdminPage.DashboardPage.components.Field.disallowSaveMessage',
    defaultMessage:
      'Please fill out all enabled options, or disable the options you want to omit from the graph.',
  },
});
