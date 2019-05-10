import { defineMessages } from 'react-intl';

export default defineMessages({
  // Modal when a user just deleted its profile
  userDeletedTitle: {
    id: 'app.containers.landing.userDeletedTitle',
    defaultMessage: 'Your account has been deleted.'
  },
  userDeletedSubtitle: {
    id: 'app.containers.landing.userDeletedSubtitle',
    defaultMessage: 'You can create a new account at any time !'
  },
  userDeletionFailed: {
    id: 'app.containers.landing.userDeletedSubtitle',
    defaultMessage: 'An error occured deleting your account, we have been notified of the isse and will do our best to fix it. Please try again later.'
  },
});
