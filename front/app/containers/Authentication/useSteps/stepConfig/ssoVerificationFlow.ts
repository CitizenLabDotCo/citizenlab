import signIn from 'api/authentication/sign_in_out/signIn';
import { handleOnSSOClick, SSOProvider } from 'api/authentication/singleSignOn';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../tracks';
import {
  AuthenticationData,
  UpdateState,
  GetRequirements,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

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
          updateState({ ssoProvider });
          setCurrentStep('sso-verification:sso-providers-policies');
        }
      },
      GO_TO_LOGIN: () => {
        setCurrentStep('sso-verification:email-password');
      },
    },

    'sso-verification:sso-providers-policies': {
      CLOSE: () => setCurrentStep('closed'),
      ACCEPT: (ssoProvider: SSOProvider) => {
        handleOnSSOClick(ssoProvider, getAuthenticationData(), true, 'signup');
      },
    },

    'sso-verification:email-password': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sso-verification:sso-providers');
      },
      SIGN_IN: async (
        email: string,
        password: string,
        rememberMe: boolean,
        tokenLifetime: number
      ) => {
        try {
          await signIn({
            email,
            password,
            rememberMe,
            tokenLifetime,
          });

          const { requirements } = await getRequirements();
          const authenticationData = getAuthenticationData();

          const missingDataStep = checkMissingData(
            requirements,
            authenticationData,
            'signin'
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

          trackEventByName(tracks.signInEmailPasswordCompleted);
        } catch (e) {
          trackEventByName(tracks.signInEmailPasswordFailed);
          throw e;
        }
      },
    },
  };
};
