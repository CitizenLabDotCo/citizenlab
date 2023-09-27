// authentication
import signIn from 'api/authentication/sign_in_out/signIn';
import { handleOnSSOClick } from 'services/singleSignOn';

// events
import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { requiredCustomFields, showOnboarding } from './utils';

// typings
import {
  AuthenticationData,
  AuthProvider,
  GetRequirements,
} from '../../typings';
import { Step } from './typings';

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
        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          authProvider,
          { ...getAuthenticationData(), flow: 'signin' },
          verificationRequired
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

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('missing-data:email-confirmation');
            return;
          }

          if (requirements.special.verification === 'require') {
            setCurrentStep('missing-data:verification');
            return;
          }

          if (requiredCustomFields(requirements.custom_fields)) {
            setCurrentStep('missing-data:custom-fields');
            return;
          }

          if (showOnboarding(requirements.onboarding)) {
            setCurrentStep('missing-data:onboarding');
            return;
          }

          setCurrentStep('closed');

          if (requirements.special.group_membership === 'require') {
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
