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
  projectBackofficeRedesignTitle: {
    id: 'app.containers.UsersEditPage.EarlyAccess.projectBackofficeRedesignTitle',
    defaultMessage: 'New project back office',
  },
  projectBackofficeRedesignDescription: {
    id: 'app.containers.UsersEditPage.EarlyAccess.projectBackofficeRedesignDescription',
    defaultMessage:
      'A new, easier to understand way to set up and manage projects. This is a work in progress: share your feedback in the #dev-tandem-uxui-revamp Slack channel.',
  },
  earlyAccessSaveError: {
    id: 'app.containers.UsersEditPage.EarlyAccess.earlyAccessSaveError',
    defaultMessage:
      'We could not save that change. This feature may no longer be available to you. Reload the page and try again.',
  },
});
