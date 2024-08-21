import signIn from 'api/authentication/sign_in_out/signIn';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';

import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../tracks';
import {
  AuthenticationData,
  AuthProvider,
  GetRequirements,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

export const signInFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  anySSOProviderEnabled: boolean
) => {
  return {
    // old sign in flow
    'sign-in:auth-providers': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sign-up:auth-providers');
      },
      SELECT_AUTH_PROVIDER: async (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('sign-in:email-password');
          return;
        }

        const { requirements } = await getRequirements();

        handleOnSSOClick(
          authProvider,
          { ...getAuthenticationData(), flow: 'signin' },
          requirements.verification
        );
      },
    },

    'sign-in:email-password': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sign-up:email-password');
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('sign-in:auth-providers');
        }
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

          const missingDataStep = checkMissingData(requirements);

          if (missingDataStep) {
            setCurrentStep(missingDataStep);
            return;
          }

          setCurrentStep('closed');

          if (doesNotMeetGroupCriteria(requirements)) {
            return;
          }

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
