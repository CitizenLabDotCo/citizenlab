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
    id: 'app.containers.Authentication.steps.EmailFlowStart.actionRequiresVerificationUsingOneOf2',
    defaultMessage:
      'This action requires verification using one of the following methods: {methods}',
  },
  orLoginWith: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.orLoginWith',
    defaultMessage: 'Or login with:',
  },
  federaTitle: {
    id: 'app.containers.Authentication.steps.EmailFlowStart.federaTitle',
    defaultMessage: 'SPID, CIE or CNS',
  },
});
