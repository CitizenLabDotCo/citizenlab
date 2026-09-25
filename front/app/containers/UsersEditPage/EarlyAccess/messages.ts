import { defineMessages } from 'react-intl';

export default defineMessages({
  earlyAccessTitle: {
    id: 'app.containers.UsersEditPage.EarlyAccess.earlyAccessTitle',
    defaultMessage: 'Early access',
  },
  earlyAccessSubtitle: {
    id: 'app.containers.UsersEditPage.EarlyAccess.earlyAccessSubtitle',
    defaultMessage:
      'Try out features we are still finishing. What you switch on here only changes what you see, not what anyone else on the platform sees.',
  },
  earlyAccessSaveError: {
    id: 'app.containers.UsersEditPage.EarlyAccess.earlyAccessSaveError',
    defaultMessage:
      'We could not save that change. This feature may no longer be available to you. Reload the page and try again.',
  },
});
