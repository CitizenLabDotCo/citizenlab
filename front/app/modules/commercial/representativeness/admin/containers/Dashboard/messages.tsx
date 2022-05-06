import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageTitle',
    defaultMessage: 'Representativeness report',
  },
  pageDescription: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageDescription',
    defaultMessage:
      'See how representative your platform users are. Compare your users with total population data using the user data collected during user registration. Learn how we calculate representativeness scores {representativenessArticleLink}.',
  },
  betaLabel: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.betaLabel',
    defaultMessage: 'BETA',
  },
  emptyStateTitle: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.emptyStateTitle',
    defaultMessage: 'Please provide a base dataset.',
  },
  emptyStateDescription: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.emptyStateDescription',
    defaultMessage:
      'This base dataset is required to calculate the representativeness of platform users compared to the total population.',
  },
  submitBaseDataButton: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.submitBaseDataButton',
    defaultMessage: 'Submit base data',
  },
});
