import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageTitle2',
    defaultMessage: 'Representativeness dashboard',
  },
  pageDescription: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageDescription3',
    defaultMessage:
      'See how representative your platform users are compared to the total population - based on data collected during user registration. Learn more about {representativenessArticleLink}.',
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
