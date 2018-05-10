import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.App.loading',
    defaultMessage: 'Loading...',
  },
  helmetTitle: {
    id: 'app.containers.App.helmetTitle',
    defaultMessage: 'Change the future of {name}',
  },
  helmetDescription: {
    id: 'app.containers.App.helmetDescription',
    defaultMessage: 'Start an idea!',
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
