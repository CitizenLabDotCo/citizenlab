import { defineMessages } from 'react-intl';

export default defineMessages({
  sessionExpiringSoonTitle: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonTitle',
    defaultMessage: 'Your session is about to expire',
  },
  sessionExpiringSoonDescriptionMinutes: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonDescriptionMinutes',
    defaultMessage:
      'You will be signed out automatically in {minutes} {minutes, plural, one {minute} other {minutes}}. Would you like to stay signed in?',
  },
  sessionExpiringSoonDescriptionSeconds: {
    id: 'app.containers.App.SessionExpiryModal.sessionExpiringSoonDescriptionSeconds',
    defaultMessage:
      'You will be signed out automatically in {seconds} {seconds, plural, one {second} other {seconds}}. Would you like to stay signed in?',
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
  tabTitleExpiringSoon: {
    id: 'app.containers.App.SessionExpiryModal.tabTitleExpiringSoon',
    defaultMessage: 'Session expiring soon',
  },
  tabTitleSignedOut: {
    id: 'app.containers.App.SessionExpiryModal.tabTitleSignedOut',
    defaultMessage: 'Signed out',
  },
});
