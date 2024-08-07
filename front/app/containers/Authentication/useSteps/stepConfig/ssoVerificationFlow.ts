import { handleOnSSOClick, SSOProvider } from 'api/authentication/singleSignOn';

import { AuthenticationData, UpdateState } from '../../typings';

import { Step } from './typings';

export const ssoVerificationFlow = (
  getAuthenticationData: () => AuthenticationData,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  return {
    'sso-verification:sso-providers': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE_WITH_SSO: (ssoProvider: SSOProvider) => {
        updateState({ ssoProvider });
        setCurrentStep('sso-verification:sso-providers-policies');
      },
      GO_TO_LOGIN: () => {
        setCurrentStep('sign-in:email-password');
      },
    },

    'sso-verification:sso-providers-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT: (ssoProvider: SSOProvider) => {
        handleOnSSOClick(
          ssoProvider,
          { ...getAuthenticationData(), flow: 'signup' },
          true
        );
      },
    },
  };
};
