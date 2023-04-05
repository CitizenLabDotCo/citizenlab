// authentication
import { handleOnSSOClick } from 'services/singleSignOn';

// typings
import { Status, AuthenticationData, AuthProvider } from '../../typings';
import { Step } from './typings';

export const oldSignUpFlow = (
  getAuthenticationData: () => AuthenticationData,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  anySSOProviderEnabled: boolean
) => {
  return {
    // old sign up flow
    'auth-providers-sign-up': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        // TODO
      },
      SELECT_AUTH_PROVIDER: (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('email-password-sign-up');
          return;
        }

        setStatus('pending');
        handleOnSSOClick(authProvider, getAuthenticationData());
      },
    },

    'email-password-sign-up': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        // TODO
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('auth-providers-sign-up');
        }
      },
      SUBMIT: () => {
        // TODO
      },
    },

    'email-confirmation-old-sign-up-flow': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: () => {
        // TODO
      },
      SUBMIT_CODE: (_code: string) => {
        // TODO
      },
    },
  };
};
