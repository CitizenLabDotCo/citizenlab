import { SupportedLocale } from 'typings';

import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
  State,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

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
            setCurrentStep('missing-data:email-confirmation');
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

    'email-flow:policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setCurrentStep('missing-data:email-confirmation');
        }

        if (result === 'email_taken') {
          setCurrentStep('email-flow:password');
        }
      },
    },

    'email-flow:password': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_PASSWORD: async (
        email: string,
        password: string,
        rememberMe: boolean,
        tokenLifetime: number
      ) => {
        await signIn({ email, password, rememberMe, tokenLifetime });

        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow
        );

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        invalidateQueryCache();

        // trackEventByName(tracks.signUpFlowCompleted);

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('access-denied');
          return;
        }

        setCurrentStep('closed');

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },
  };
};
