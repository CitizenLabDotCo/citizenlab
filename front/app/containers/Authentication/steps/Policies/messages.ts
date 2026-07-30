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
  byContinuingPhone: {
    id: 'app.containers.Authentication.steps.Policies.byContinuingPhone',
    defaultMessage:
      "By continuing, you agree to receive text messages from this platform. You can select which messages you wish to receive in the 'My Settings' page.",
  },
});
