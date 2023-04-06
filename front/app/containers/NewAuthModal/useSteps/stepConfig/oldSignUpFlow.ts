// authentication
import { handleOnSSOClick } from 'services/singleSignOn';
import createAccountWithPassword, {
  Parameters as CreateAccountParams,
} from 'api/authentication/createAccountWithPassword';
import confirmEmail from 'api/authentication/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';

// typings
import {
  Status,
  AuthenticationData,
  AuthProvider,
  ErrorCode,
} from '../../typings';
import { Step } from './typings';

export const oldSignUpFlow = (
  getAuthenticationData: () => AuthenticationData,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
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
      SUBMIT: async (params: CreateAccountParams) => {
        setStatus('pending');

        try {
          await createAccountWithPassword(params);
          setStatus('ok');
          setCurrentStep('sign-up:email-confirmation');
        } catch {
          setStatus('error');
          setError('account_creation_failed');
        }
      },
    },

    'sign-up:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: () => {
        setCurrentStep('sign-up:change-email');
      },
      SUBMIT_CODE: async (code: string) => {
        setStatus('pending');

        try {
          await confirmEmail({ code });
          setStatus('ok');
          setCurrentStep('success'); // TODO
        } catch (e) {
          setStatus('error');

          if (e?.code?.[0]?.error === 'invalid') {
            setError('wrong_confirmation_code');
          } else {
            setError('unknown');
          }
        }
      },
    },

    'sign-up:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => {
        setCurrentStep('sign-up:email-confirmation');
      },
      RESEND_CODE: async (newEmail: string) => {
        setStatus('pending');

        try {
          await resendEmailConfirmationCode(newEmail);
          setStatus('ok');
          setCurrentStep('sign-up:email-confirmation');
        } catch {
          setStatus('error');
          setError('unknown');
        }
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
