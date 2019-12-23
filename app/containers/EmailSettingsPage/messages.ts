import {
  defineMessages
} from 'react-intl';

export default defineMessages({
  initialUnsubscribeSuccess: {
    id: 'EmailSettingsPage.initialUnsubscribeSuccess',
    defaultMessage: 'You successfully unsubscribed from this campaign. You will not receive this type of email anymore, see the form below to review your other consents.'
  },
  initialUnsubscribeError: {
    id: 'EmailSettingsPage.initialUnsubscribeError',
    defaultMessage: 'There was an issue unsubscribing from this campaign, please try again.'
  },
  initialUnsubscribeLoading: {
    id: 'EmailSettingsPage.initialUnsubscribeLoading',
    defaultMessage: 'Your request is being processed, please wait...'
  }
});
