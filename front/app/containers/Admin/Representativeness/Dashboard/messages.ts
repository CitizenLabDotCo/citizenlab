import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageTitle3',
    defaultMessage: 'Community representation',
  },
  pageDescription: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageDescription3',
    defaultMessage:
      'See how representative your platform users are compared to the total population - based on data collected during user registration. Learn more about {representativenessArticleLink}.',
  },
  pageDescriptionTemporary: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.pageDescriptionTemporary',
    defaultMessage:
      'See how representative your platform users are compared to the total population - based on data collected during user registration.',
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
