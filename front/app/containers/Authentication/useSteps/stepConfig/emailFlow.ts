import { SupportedLocale } from 'typings';

import resendEmailConfirmationCodeUnauthenticated from 'api/authentication/confirm_email/resendEmailConfirmationCodeUnauthenticated';
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
    emailstart: {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string) => {
        updateState({ email });

        try {
          const response = await checkUser(email);
          const { action } = response.data.attributes;

          if (action === 'terms') {
            updateState({ flow: 'signup' });
            setCurrentStep('emailpolicies');
          }

          if (action === 'password') {
            updateState({ flow: 'signin' });
            setCurrentStep('emailpassword');
          }

          if (action === 'confirm') {
            updateState({ flow: 'signin' });
            await resendEmailConfirmationCodeUnauthenticated(email);
            setCurrentStep('missing-data:email-confirmation');
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
            setCurrentStep('emailsso-policies');
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

    emailpolicies: {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT_POLICIES: async (email: string, locale: SupportedLocale) => {
        updateState({ email });

        const result = await createEmailOnlyAccount({ email, locale });

        if (result === 'account_created_successfully') {
          if (userConfirmationEnabled) {
            setCurrentStep('missing-data:email-confirmation');
          } else {
            // If user confirmation is not enabled, we can
            // request a JWT for the unconfirmed user and proceed
            await getUserTokenUnconfirmed(email);

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

            setCurrentStep('success');
          }
        }

        if (result === 'email_taken') {
          setCurrentStep('emailpassword');
        }
      },
      GO_BACK: () => setCurrentStep('emailstart'),
    },

    emailpassword: {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => setCurrentStep('emailstart'),
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
          state.flow
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

    'emailsso-policies': {
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
