// authentication
import { handleOnSSOClick } from 'services/singleSignOn';
import createAccountWithPassword, {
  Parameters as CreateAccountParams,
} from 'api/authentication/createAccountWithPassword';
import confirmEmail from 'api/authentication/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';
import { updateUser } from 'services/users';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { askCustomFields } from './utils';

// typings
import {
  Status,
  AuthenticationData,
  AuthProvider,
  ErrorCode,
  GetRequirements,
} from '../../typings';
import { Step } from './typings';
import { FormData } from 'components/UserCustomFieldsForm';

export const oldSignUpFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
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
      CLOSE: () => {
        setCurrentStep('closed');
        trackEventByName(tracks.signUpEmailPasswordStepExited);
      },
      SWITCH_FLOW: () => {
        setCurrentStep('sign-in:email-password');
        trackEventByName(tracks.signUpEmailPasswordStepExited);
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('sign-up:auth-providers');
          trackEventByName(tracks.signUpEmailPasswordStepExited);
        }
      },
      SUBMIT: async (params: CreateAccountParams) => {
        setStatus('pending');

        try {
          await createAccountWithPassword(params);
          setStatus('ok');
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);

          const { requirements } = await getRequirements();
          const emailConfirmationRequired =
            requirements.special.confirmation === 'require';

          if (emailConfirmationRequired) {
            setCurrentStep('sign-up:email-confirmation');
            return;
          }

          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-up:verification');
            return;
          }

          if (askCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-up:custom-fields');
            return;
          }

          setCurrentStep('success');
        } catch {
          setStatus('error');
          setError('account_creation_failed');
          trackEventByName(tracks.signInEmailPasswordFailed);
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

          const { requirements } = await getRequirements();

          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-up:verification');
            return;
          }

          if (askCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-up:custom-fields');
            return;
          }

          setCurrentStep('success');
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
          setCurrentStep('sign-up:email-confirmation');
          setStatus('ok');
        } catch {
          setStatus('error');
          setError('unknown');
        }
      },
    },

    'sign-up:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        setCurrentStep('success');
      },
    },

    'sign-up:custom-fields': {
      CLOSE: () => {
        setCurrentStep('closed');
        trackEventByName(tracks.signUpCustomFieldsStepExited);
      },
      SUBMIT: async (userId: string, formData: FormData) => {
        setStatus('pending');

        try {
          await updateUser(userId, { custom_field_values: formData });
          setStatus('ok');
          setCurrentStep('success');
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);
        } catch {
          setStatus('error');
          setError('unknown');
          trackEventByName(tracks.signUpCustomFieldsStepFailed);
        }
      },
      SKIP: async () => {
        setCurrentStep('success');
        trackEventByName(tracks.signUpCustomFieldsStepSkipped);
      },
    },
  };
};
