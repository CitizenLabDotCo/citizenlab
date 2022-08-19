import { defineMessages } from 'react-intl';

export default defineMessages({
  // Modal when a user just deleted its profile
  userDeletedTitle: {
    id: 'app.containers.landing.userDeletedTitle',
    defaultMessage: 'Your account has been deleted.',
  },
  userDeletedSubtitle: {
    id: 'app.containers.landing.userDeletedSubtitle',
    defaultMessage:
      'You can create a new account at any time or {contactLink} to let us know what we can improve.',
  },
  userDeletedSubtitleLinkText: {
    id: 'app.containers.landing.userDeletedSubtitleLinkText',
    defaultMessage: 'drop us a line',
  },
  userDeletedSubtitleLinkUrl: {
    id: 'app.containers.landing.userDeletedSubtitleLinkUrl',
    defaultMessage: 'https://citizenlabco.typeform.com/to/z7baRP?source={url}',
  },
  userDeletionFailed: {
    id: 'app.containers.landing.userDeletionFailed',
    defaultMessage:
      'An error occured deleting your account, we have been notified of the isse and will do our best to fix it. Please try again later.',
  },
});
