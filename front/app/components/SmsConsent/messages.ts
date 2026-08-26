import { defineMessages } from 'react-intl';

// Each disclosure is a full sentence rather than composed fragments, both for
// translation quality and because the wording is submitted verbatim as opt-in
// evidence for toll-free verification.
export default defineMessages({
  phoneConfirmationDisclosure: {
    id: 'app.components.SmsConsent.phoneConfirmationDisclosure',
    defaultMessage:
      "By submitting, you agree to receive a one-time confirmation code by SMS from {orgName}. If you opted in above, you'll also receive news and updates; message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. See our {termsLink} and {privacyLink}.",
  },
  campaignPreferencesDisclosure: {
    id: 'app.components.SmsConsent.campaignPreferencesDisclosure',
    defaultMessage:
      'By selecting any SMS option above, you agree to receive text messages from {orgName} at the number on your account. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. See our {termsLink} and {privacyLink}.',
  },
  termsLinkText: {
    id: 'app.containers.PhoneChange.termsLinkText',
    defaultMessage: 'Terms',
  },
  privacyLinkText: {
    id: 'app.containers.PhoneChange.privacyLinkText',
    defaultMessage: 'Privacy Policy',
  },
  smsManualCampaignConsentLabel2: {
    id: 'app.containers.PhoneChange.smsManualCampaignConsentLabel2',
    defaultMessage: "I'd like to receive news and updates by SMS (optional).",
  },
});
