import { handleOnSSOClick, SSOProvider } from 'api/authentication/singleSignOn';

import {
  AuthenticationData,
  UpdateState,
  GetRequirements,
} from '../../typings';

import { Step } from './typings';

export const ssoVerificationFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  return {
    'sso-verification:sso-providers': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE_WITH_SSO: async (ssoProvider: SSOProvider) => {
        const { disabled_reason } = await getRequirements();

        const signedIn = disabled_reason !== 'user_not_signed_in';

        if (signedIn) {
          handleOnSSOClick(
            ssoProvider,
            getAuthenticationData(),
            true,
            'signup'
          );
        } else {
          if (ssoProvider === 'clave_unica') {
            handleOnSSOClick(
              ssoProvider,
              getAuthenticationData(),
              true,
              'signup'
            );
          } else {
            updateState({ ssoProvider });
            setCurrentStep('sso-verification:sso-providers-policies');
          }
        }
      },
      GO_TO_LOGIN: () => {
        setCurrentStep('email:start');
      },
    },

    'sso-verification:sso-providers-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT: (ssoProvider: SSOProvider) => {
        handleOnSSOClick(ssoProvider, getAuthenticationData(), true, 'signup');
      },
    },
  };
};
