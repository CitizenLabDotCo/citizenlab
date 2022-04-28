import { defineMessages } from 'react-intl';

export default defineMessages({
  tabRepresentativeness: {
    id: 'app.containers.AdminPage.DashboardPage.tabRepresentativeness',
    defaultMessage: 'Representativeness',
  },
  percentageUsersIncluded: {
    id: 'app.containers.AdminPage.DashboardPage.percentageUsersIncluded',
    defaultMessage: '{percentage} of users included',
  },
  required: {
    id: 'app.containers.AdminPage.DashboardPage.required',
    defaultMessage: 'Required',
  },
  optional: {
    id: 'app.containers.AdminPage.DashboardPage.optional',
    defaultMessage: 'Optional',
  },
  forUserRegistation: {
    id: 'app.containers.AdminPage.DashboardPage.forUserRegistation',
    defaultMessage: '{requiredOrOptional} for user registration',
  },
  users: {
    id: 'app.containers.AdminPage.DashboardPage.users',
    defaultMessage: 'Users',
  },
  totalPopulation: {
    id: 'app.containers.AdminPage.DashboardPage.totalPopulation',
    defaultMessage: 'Total population',
  },
  dataHiddenWarning: {
    id: 'app.containers.AdminPage.DashboardPage.dataHiddenWarning',
    defaultMessage:
      '{numberOfHiddenItems, plural, one {# item is} other {# items are}} hidden in this graph. Change to {tableViewLink} to view all data.',
  },
  tableViewLinkText: {
    id: 'app.containers.AdminPage.DashboardPage.tableViewLinkText',
    defaultMessage: 'table view',
  },
});
