import { defineMessages } from 'react-intl';

export default defineMessages({
  percentageUsersIncluded: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.percentageUsersIncluded',
    defaultMessage: '{percentage} of users included',
  },
  required: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.required',
    defaultMessage: 'Required',
  },
  optional: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.optional',
    defaultMessage: 'Optional',
  },
  forUserRegistation: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.forUserRegistation',
    defaultMessage: '{requiredOrOptional} for user registration',
  },
  users: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.users',
    defaultMessage: 'Users',
  },
  totalPopulation: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.totalPopulation',
    defaultMessage: 'Total population',
  },
  dataHiddenWarning: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.dataHiddenWarning',
    defaultMessage:
      '{numberOfHiddenItems, plural, one {# item is} other {# items are}} hidden in this graph. Change to {tableViewLink} to view all data.',
  },
  tableViewLinkText: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.tableViewLinkText',
    defaultMessage: 'table view',
  },
  representativenessScoreText: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.representativenessScoreText',
    defaultMessage: 'Representativeness score:',
  },
  representativenessScoreTooltipText: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.representativenessScoreTooltipText',
    defaultMessage:
      "The score shows how similar the distributions of platform users and total population. Learn more about how it's calculated {representativenessArticleLink}.",
  },
  item: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.item',
    defaultMessage: 'Item',
  },
  openTableModalButtonText: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.openTableModalButtonText',
    defaultMessage: 'Show {numberOfHiddenItems} more',
  },
  provideBaseDataset: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.provideBaseDataset',
    defaultMessage: 'Please provide a base dataset.',
  },
  baseDatasetExplanation: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.baseDatasetExplanation',
    defaultMessage:
      'This base dataset is required to calculate the representativeness of platform users compared to the total population.',
  },
  submitBaseDataButton: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.submitBaseDataButton',
    defaultMessage: 'Submit base data',
  },
});
