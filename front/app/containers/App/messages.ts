import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.App.loading',
    defaultMessage: 'Loading...',
  },
  metaTitle: {
    id: 'app.containers.App.metaTitle',
    defaultMessage: 'Citizen engagement platform of {orgName} | CitizenLab',
  },
  appMetaDescription: {
    id: 'app.containers.App.appMetaDescription',
    defaultMessage:
      'Welcome to the online participation platform of {orgName}. \nExplore local projects and engage in the discussion!',
  },
  fakeMessageToTestCrowdinEnterprise: {
    id: 'app.containers.App.fakeMessageToTestCrowdinEnterprise',
    defaultMessage:
      'Can monkeys sing? This is a fake translation to test Crowdin enterprise.',
  },
});
