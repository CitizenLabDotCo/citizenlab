import { SupportedLocale } from 'typings';

import { confirmEmailConfirmationCodeUnauthenticated } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestEmailConfirmationCodeUnauthenticated } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import getUserTokenUnconfirmed from 'api/authentication/sign_in_out/getUserTokenUnconfirmed';
import signIn from 'api/authentication/sign_in_out/signIn';
import createEmailOnlyAccount from 'api/authentication/sign_up/createEmailOnlyAccount';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import {
  GetRequirements,
  UpdateState,
  SSOProviderWithoutVienna,
  AuthenticationData,
  State,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

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

        try {
          const response = await checkUser(email);
          const { action } = response.data.attributes;

          if (action === 'terms') {
            updateState({ flow: 'signup' });
            setCurrentStep('email:policies');
          }

          if (action === 'password') {
            updateState({ flow: 'signin' });
            setCurrentStep('email:password');
          }

          if (action === 'confirm') {
            updateState({ flow: 'signin' });
            await requestEmailConfirmationCodeUnauthenticated(email);
            setCurrentStep('email:confirmation');
          }

          if (action === 'token') {
            updateState({ flow: 'signin' });
            await getUserTokenUnconfirmed(email);

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

            setCurrentStep('success');
          }
        } catch (e) {
          if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
            setCurrentStep('invite:taken');
          } else {
            throw e;
          }
        }
      },

      CONTINUE_WITH_SSO: (ssoProvider: SSOProviderWithoutVienna) => {
        if (ssoProvider === 'clave_unica') {
          // If clave unica, we always go straight to SSO login
          handleOnSSOClick(
            ssoProvider,
            getAuthenticationData(),
            true,
            state.flow
          );
        } else {
          // If other SSO provider, it depends on the flow
          if (state.flow === 'signin') {
            handleOnSSOClick(
              ssoProvider,
              getAuthenticationData(),
              true,
              state.flow
            );
          } else {
            updateState({ ssoProvider });
            setCurrentStep('email:sso-policies');
          }
        }
      },

      ENTER_FRANCE_CONNECT: async () => {
        const { requirements } = await getRequirements();

        handleOnSSOClick(
          'franceconnect',
          getAuthenticationData(),
          requirements.verification,
          'signin'
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
