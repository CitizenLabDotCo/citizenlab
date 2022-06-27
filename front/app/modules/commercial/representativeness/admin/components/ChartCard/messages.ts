import { defineMessages } from 'react-intl';

export default defineMessages({
  includedUsersMessage: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.includedUsersMessage2',
    defaultMessage: '{known} out of {total} users included ({percentage})',
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
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.representativenessScoreTooltipText3',
    defaultMessage:
      'This score reflects how accurately platform user data reflects the total population. Learn more about {representativenessArticleLink}.',
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
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.baseDatasetExplanation1',
    defaultMessage:
      'A base dataset is required to measure the representation of platform users.',
  },
  submitBaseDataButton: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.submitBaseDataButton',
    defaultMessage: 'Submit base data',
  },
  comingSoon: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.comingSoon',
    defaultMessage: 'Coming soon',
  },
  comingSoonDescription: {
    id: 'app.containers.AdminPage.DashboardPage.components.ChartCard.comingSoonDescription',
    defaultMessage:
      "We're currently working on the {fieldName} dashboard, it will be available soon",
  },
});
