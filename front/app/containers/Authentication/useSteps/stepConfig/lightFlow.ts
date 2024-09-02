import { SupportedLocale } from 'typings';

import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

import tracks from '../../tracks';
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
    // light flow
    'light-flow:email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_EMAIL: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        const response = await checkUser(email);
        const { action } = response.data.attributes;

        if (action === 'terms') {
          setCurrentStep('light-flow:email-policies');
        }

        if (action === 'password') {
          setCurrentStep('light-flow:password');
        }

        if (action === 'confirm') {
          await createEmailOnlyAccount({ email, locale });
          setCurrentStep('light-flow:email-confirmation');
        }
      },
      CONTINUE_WITH_SSO: (ssoProvider: SSOProviderWithoutVienna) => {
        if (ssoProvider === 'franceconnect') {
          setCurrentStep('light-flow:france-connect-login');
        } else {
          updateState({ ssoProvider });
          setCurrentStep('light-flow:sso-policies');
        }
      },
    },

    'light-flow:email-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          setCurrentStep('light-flow:email-confirmation');
        }

        if (result === 'email_taken') {
          setCurrentStep('light-flow:password');
        }
      },
    },

    'light-flow:sso-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: (ssoProvider: SSOProviderWithoutVienna) => {
        handleOnSSOClick(
          ssoProvider,
          getAuthenticationData(),
          true,
          state.flow
        );
      },
    },

    'light-flow:france-connect-login': {
      CLOSE: () => setCurrentStep('closed'),
      LOGIN: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'franceconnect',
          getAuthenticationData(),
          requirements.verification,
          'signin'
        );
      },
    },

    'light-flow:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('light-flow:email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

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

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('access-denied');
          return;
        }

        setCurrentStep('success');
      },
    },

    'light-flow:password': {
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

        trackEventByName(tracks.signUpFlowCompleted);

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
