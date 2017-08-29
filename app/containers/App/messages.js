/*
 * App Messages
 *
 * This contains all the text for the App component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.App.loading',
    defaultMessage: 'Loading...',
  },
  helmetTitle: {
    id: 'app.containers.App.helmetTitle',
    defaultMessage: 'Home page',
  },
  helmetDescription: {
    id: 'app.containers.App.helmetDescription',
    defaultMessage: 'Citizenlab 2 platform {organizationName}',
  },
  unAuthorizedUser: {
    id: 'app.containers.App.unAuthorizedUser',
    defaultMessage: 'Ups; it looks like you wandered to the wrong page...',
  },
  currentUserLoadingMessage: {
    id: 'app.containers.App.currentUserLoadingMessage',
    defaultMessage: 'loading...',
  },
  currentUserLoadingError: {
    id: 'app.containers.App.currentUserLoadingError',
    defaultMessage: 'Ups; something went terrybly wrong. kill the developer!',
  },
});
