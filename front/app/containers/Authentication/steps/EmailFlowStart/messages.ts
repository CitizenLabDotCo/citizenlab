import { defineMessages } from 'react-intl';

export default defineMessages({
  clickHereToLoginAsAdminOrPM: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.clickHereToLoginAsAdminOrPM',
    defaultMessage: 'Click here to login as admin or project manager',
  },
  actionRequiresVerificationUsingMethod: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.actionRequiresVerificationUsingMethod',
    defaultMessage: 'This action requires verification using {method}.',
  },
  actionRequiresVerificationUsingOneOf: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.actionRequiresVerificationUsingOneOf',
    defaultMessage:
      'This action requires verification using one of the following methods:',
  },
  orFirstSignInThenVerify: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.orFirstSignInThenVerify',
    defaultMessage: 'Or, first sign in and then verify:',
  },
});
