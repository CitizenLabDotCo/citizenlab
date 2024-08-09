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
import {
  confirmationRequired,
  requiredCustomFields,
  showOnboarding,
  doesNotMeetGroupCriteria,
} from './utils';

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

          if (confirmationRequired(requirements)) {
            setCurrentStep('missing-data:email-confirmation');
            return;
          }

          if (requirements.verification) {
            setCurrentStep('missing-data:verification');
            return;
          }

          if (requiredCustomFields(requirements)) {
            setCurrentStep('missing-data:custom-fields');
            return;
          }

          if (showOnboarding(requirements)) {
            setCurrentStep('missing-data:onboarding');
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
