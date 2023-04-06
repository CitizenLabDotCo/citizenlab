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
    'sign-up:auth-providers': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sign-in:auth-providers');
      },
      SELECT_AUTH_PROVIDER: (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('sign-up:email-password');
          return;
        }

        setStatus('pending');
        handleOnSSOClick(authProvider, getAuthenticationData());
      },
    },

    'sign-up:email-password': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sign-in:email-password');
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('sign-up:auth-providers');
        }
      },
      SUBMIT: () => {
        // TODO
      },
    },

    'sign-up:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: () => {
        // TODO
      },
      SUBMIT_CODE: (_code: string) => {
        // TODO
      },
    },

    'sign-up:verification': {
      CLOSE: () => setCurrentStep('closed'),
      // TODO
    },

    'sign-up:registration-fields': {
      CLOSE: () => setCurrentStep('closed'),
      // TODO
    },
  };
};
