import { defineMessages } from 'react-intl';

export default defineMessages({
  sessionExpiringSoonTitle: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonTitle',
    defaultMessage: 'Your session is about to expire',
  },
  sessionExpiringSoonDescription: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonDescription',
    defaultMessage:
      'You will be logged out soon. Would you like to stay logged in?',
  },
  stayLoggedIn: {
    id: 'app.containers.App.SessionExpiryModal.stayLoggedIn',
    defaultMessage: 'Stay logged in',
  },
  sessionExpiredTitle: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiredTitle',
    defaultMessage: 'You have been logged out',
  },
  sessionExpiredDescription: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiredDescription',
    defaultMessage:
      'Your session has expired. Please log in again to continue.',
  },
  logInAgain: {
    id: 'app.containers.App.SessionExpiryModal.logInAgain',
    defaultMessage: 'Log in again',
  },
});
