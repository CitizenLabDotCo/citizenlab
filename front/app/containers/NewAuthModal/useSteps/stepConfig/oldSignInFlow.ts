// authentication
import signIn from 'api/authentication/signIn';
import { handleOnSSOClick } from 'services/singleSignOn';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// typings
import {
  Status,
  ErrorCode,
  AuthenticationData,
  AuthProvider,
} from '../../typings';
import { Step } from './typings';

export const oldSignInFlow = (
  getAuthenticationData: () => AuthenticationData,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  anySSOProviderEnabled: boolean
) => {
  return {
    // old sign in flow
    'auth-providers-sign-in': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        // TODO
      },
      SELECT_AUTH_PROVIDER: (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('email-password-sign-in');
          return;
        }

        setStatus('pending');
        handleOnSSOClick(authProvider, getAuthenticationData());
      },
    },

    'email-password-sign-in': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        // TODO
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('auth-providers-sign-in');
        }
      },
      SIGN_IN: async (
        email: string,
        password: string,
        rememberMe: boolean,
        tokenLifetime: number
      ) => {
        setStatus('pending');

        try {
          await signIn({
            email,
            password,
            rememberMe,
            tokenLifetime,
          });

          setCurrentStep('closed');

          const { successAction } = getAuthenticationData();
          if (successAction) {
            triggerSuccessAction(successAction);
          }

          trackEventByName(tracks.signInEmailPasswordCompleted);

          setStatus('ok');
        } catch {
          setStatus('error');
          setError('wrong_password');
          trackEventByName(tracks.signInEmailPasswordFailed);
        }
      },
    },
  };
};
