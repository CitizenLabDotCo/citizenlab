// import {
//   GetRequirements,
//   AuthenticationData,
// } from '../../typings';

import { Step } from './typings';

export const ssoVerificationFlow = (
  // _getAuthenticationData: () => AuthenticationData,
  // _getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void
) => {
  return {
    'sso-verification:sso-providers': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE_WITH_SSO: () => {
        setCurrentStep('sso-verification:sso-providers-policies');
      },
      GO_TO_LOGIN: () => {
        setCurrentStep('sign-in:email-password');
      },
    },

    'sso-verification:sso-providers-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT: () => {
        setCurrentStep('closed'); // TODO
      },
    },
  };
};
