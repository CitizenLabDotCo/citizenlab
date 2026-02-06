import { SupportedLocale } from 'typings';

import { confirmEmailConfirmationCodeUnauthenticated } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestEmailConfirmationCodeUnauthenticated } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import getUserTokenUnconfirmed from 'api/authentication/sign_in_out/getUserTokenUnconfirmed';
import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
  State,
} from '../../typings';

import { Step } from './typings';
import {
  doesNotMeetGroupCriteria,
  checkMissingData,
  handleSubmitEmail,
  handleSSOClick,
} from './utils';

export const emailFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  state: State,
  userConfirmationEnabled: boolean
) => {
  return {
    'email:start': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string) => {
        updateState({ email });
        handleSubmitEmail(
          email,
          getAuthenticationData,
          getRequirements,
          setCurrentStep,
          updateState
        );
      },

      CONTINUE_WITH_SSO: async (ssoProvider: SSOProviderWithoutVienna) => {
        handleSSOClick(
          ssoProvider,
          getAuthenticationData,
          getRequirements,
          setCurrentStep,
          updateState,
          state
        );
      },
    },

    'email:policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          if (userConfirmationEnabled) {
            setCurrentStep('email:confirmation');
          } else {
            // If user confirmation is not enabled, we can
            // request a JWT for the unconfirmed user and proceed
            await getUserTokenUnconfirmed(email);

            const { requirements } = await getRequirements();
            const authenticationData = getAuthenticationData();

            const missingDataStep = checkMissingData(
              requirements,
              authenticationData,
              state.flow,
              false
            );

            if (missingDataStep) {
              setCurrentStep(missingDataStep);
              return;
            }

            setCurrentStep('success');
          }
        }

        if (result === 'email_taken') {
          setCurrentStep('email:password');
        }
      },
      GO_BACK: () => setCurrentStep('email:start'),
    },

    'email:password': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => setCurrentStep('email:start'),
      SUBMIT_PASSWORD: async (
        email: string,
        password: string,
        rememberMe: boolean,
        tokenLifetime: number
      ) => {
        updateState({ email });
        await signIn({ email, password, rememberMe, tokenLifetime });

        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow,
          true
        );

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

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

    'email:confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('email:start');
      },
      SUBMIT_CODE: async (email: string, code: string) => {
        await confirmEmailConfirmationCodeUnauthenticated(email, code);
        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow,
          true
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
      RESEND_CODE: async (email: string) => {
        await requestEmailConfirmationCodeUnauthenticated(email);
      },
    },

    'email:sso-policies': {
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
  };
};
