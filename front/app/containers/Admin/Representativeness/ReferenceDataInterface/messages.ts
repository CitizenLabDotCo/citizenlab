import { defineMessages } from 'react-intl';

export default defineMessages({
  backToDashboard: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.referenceDataInterface.backToDashboard',
    defaultMessage: 'Back to dashboard',
  },
  pageTitle: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.referenceDataInterface.pageTitle2',
    defaultMessage: 'Edit base data',
  },
  pageDescription: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.referenceDataInterface.pageDescription',
    defaultMessage:
      'Here you can show/hide items on the dashboard and enter the base data. Only the enabled fields for {userRegistrationLink} will appear here.',
  },
  userRegistrationLink: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.referenceDataInterface.userRegistrationLink',
    defaultMessage: 'user registration',
  },
  noEnabledFieldsSupported: {
    id: 'app.containers.AdminPage.DashboardPage.representativeness.referenceDataInterface.noEnabledFieldsSupported',
    defaultMessage:
      'None of the enabled registration fields are supported at the moment.',
  },
});
