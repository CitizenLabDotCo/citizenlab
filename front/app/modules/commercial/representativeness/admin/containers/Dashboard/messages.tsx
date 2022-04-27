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
  representativenessArticleLink: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.representativenessArticleLink',
    defaultMessage: 'here',
  },
  betaLabel: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.betaLabel',
    defaultMessage: 'BETA',
  },
});
