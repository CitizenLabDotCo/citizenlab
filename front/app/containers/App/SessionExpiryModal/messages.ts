import { defineMessages } from 'react-intl';

export default defineMessages({
  sessionExpiringSoonTitle: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonTitle',
    defaultMessage: 'Your session is about to expire',
  },
  sessionExpiringSoonDescription: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonDescription1',
    defaultMessage:
      'You will be signed out soon. Would you like to stay signed in?',
  },
  stayLoggedIn: {
    id: 'app.containers.App.SessionExpiryModal.staySignedIn',
    defaultMessage: 'Stay signed in',
  },
  sessionExpiredTitle: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiredTitle1',
    defaultMessage: 'You have been signed out',
  },
  sessionExpiredDescription: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiredDescription1',
    defaultMessage:
      'Your session has expired. Please sign in again to continue.',
  },
  logInAgain: {
    id: 'app.containers.App.SessionExpiryModal.signInAgain',
    defaultMessage: 'Sign in again',
  },
  signOut: {
    id: 'app.containers.App.SessionExpiryModal.signOut',
    defaultMessage: 'Sign out',
  },
  staySignedOut: {
    id: 'app.containers.App.SessionExpiryModal.staySignedOut',
    defaultMessage: 'Stay signed out',
  },
});
