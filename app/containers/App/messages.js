import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.App.loading',
    defaultMessage: 'Loading...',
  },
  metaTitle: {
    id: 'app.containers.App.metaTitle',
    defaultMessage: 'Citizen engagement platform of {orgName} | CitizenLab',
  },
  metaDescription: {
    id: 'app.containers.App.metaDescription',
    defaultMessage: 'Welcome to the online citizen engagement platform of {orgName}.\nExplore local projects and vote on your favourite ideas. Come participate in the discussions!',
  },
  unAuthorizedUser: {
    id: 'app.containers.App.unAuthorizedUser',
    defaultMessage: 'Oops, it looks like you wandered to the wrong page...',
  },
  currentUserLoadingMessage: {
    id: 'app.containers.App.currentUserLoadingMessage',
    defaultMessage: 'loading...',
  },
  currentUserLoadingError: {
    id: 'app.containers.App.currentUserLoadingError',
    defaultMessage: 'Oops, something went terrybly wrong. kill the developer!',
  },
});
