import { SupportedLocale } from 'typings';

import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
  State,
} from '../../typings';

import { Step } from './typings';

export const lightFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  state: State
) => {
  return {
    'email-flow:start': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        try {
          const response = await checkUser(email);
          const { action } = response.data.attributes;

          if (action === 'terms') {
            setCurrentStep('email-flow:policies');
          }

          if (action === 'password') {
            setCurrentStep('email-flow:password');
          }

          if (action === 'confirm') {
            await createEmailOnlyAccount({ email, locale });
            setCurrentStep('email-flow:email-confirmation');
          }
        } catch (e) {
          if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
            setCurrentStep('taken-by-invite');
          } else {
            throw e;
          }
        }
      },

      CONTINUE_WITH_SSO: (ssoProvider: SSOProviderWithoutVienna) => {
        if (ssoProvider === 'franceconnect') {
          setCurrentStep('light-flow:france-connect-login');
        } else if (ssoProvider === 'clave_unica') {
          handleOnSSOClick(
            ssoProvider,
            getAuthenticationData(),
            true,
            state.flow
          );
        } else {
          updateState({ ssoProvider });
          setCurrentStep('light-flow:sso-policies');
        }
      },
    },
  };
};
