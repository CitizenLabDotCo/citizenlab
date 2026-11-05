import { defineMessages } from 'react-intl';

export default defineMessages({
  reviewTheTerms: {
    id: 'app.containers.NewAuthModal.steps.AcceptPolicies.reviewTheTerms',
    defaultMessage: 'Review the terms below to continue.',
  },
  byContinuing: {
    id: 'app.containers.NewAuthModal.steps.EmailSignUp.byContinuing',
    defaultMessage:
      "By continuing, you agree to receive emails from this platform. You can select which emails you wish to receive in the 'My Settings' page.",
  },
  createANewAccountWith: {
    id: 'app.containers.NewAuthModal.steps.Policies.createANewAccountWith',
    defaultMessage: 'Create a new account with: {email} {changeLink}',
  },
  change: {
    id: 'app.containers.NewAuthModal.steps.Policies.change1',
    defaultMessage: 'change',
  },
  createANewAccountWithPhone: {
    id: 'app.containers.Authentication.steps.Policies.createANewAccountWithPhone',
    defaultMessage: 'Create a new account with: {phone} {changeLink}',
  },
  // Submitted verbatim as opt-in evidence for toll-free verification.
  byContinuingPhoneWithCampaignsEnabled: {
    id: 'app.containers.Authentication.steps.Policies.byContinuingPhone3',
    defaultMessage:
      "By continuing, you agree to receive a one-time confirmation code by SMS from {orgName}. If you opted in above, you'll also receive news and updates; message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out.",
  },
  byContinuingPhoneWithoutCampaignsEnabled: {
    id: 'app.containers.Authentication.steps.Policies.byContinuingPhoneWithoutCampaignsEnabled',
    defaultMessage:
      'By continuing, you agree to receive a one-time confirmation code by SMS from {orgName}. Message and data rates may apply. Reply HELP for help, STOP to opt out.',
  },
});
