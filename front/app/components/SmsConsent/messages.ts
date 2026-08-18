import { defineMessages } from 'react-intl';

export default defineMessages({
  smsConfirmationDisclosure: {
    id: 'app.components.SmsConsent.smsConfirmationDisclosure',
    defaultMessage:
      'By providing your phone number, you agree to receive a one-time confirmation code by SMS at the number provided. Message and data rates may apply. View {termsLink} and {privacyLink}.',
  },
  termsLinkText: {
    id: 'app.containers.PhoneChange.termsLinkText',
    defaultMessage: 'Terms',
  },
  privacyLinkText: {
    id: 'app.containers.PhoneChange.privacyLinkText',
    defaultMessage: 'Privacy Policy',
  },
  smsManualCampaignConsentLabel: {
    id: 'app.containers.PhoneChange.smsManualCampaignConsentLabel',
    defaultMessage:
      "I'd also like to receive updates and campaign messages by SMS. You can opt out at any time.",
  },
});
