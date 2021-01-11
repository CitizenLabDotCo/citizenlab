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
  metaDescription: {
    id: 'app.containers.App.metaDescription',
    defaultMessage:
      'Welcome to the online citizen engagement platform of {orgName}.\nExplore local projects and vote on your favourite ideas. Come participate in the discussions!',
  },
  testMessage: {
    id: 'app.containers.App.testMessage',
    defaultMessage: 'No need to translate. Just a test!',
  },
});
