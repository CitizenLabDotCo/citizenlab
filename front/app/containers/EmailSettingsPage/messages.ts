import { defineMessages } from 'react-intl';

export default defineMessages({
  initialUnsubscribeSuccess: {
    id: 'EmailSettingsPage.initialUnsubscribeSuccess',
    defaultMessage: 'You successfully unsubscribed from {campaignTitle}.',
  },
  initialUnsubscribeError: {
    id: 'EmailSettingsPage.initialUnsubscribeError',
    defaultMessage:
      'There was an issue unsubscribing from this campaign, please try again.',
  },
  initialUnsubscribeLoading: {
    id: 'EmailSettingsPage.initialUnsubscribeLoading',
    defaultMessage: 'Your request is being processed, please wait...',
  },
  emailSettings: {
    id: 'EmailSettingsPage.emailSettings',
    defaultMessage: 'Email settings',
  },
});
