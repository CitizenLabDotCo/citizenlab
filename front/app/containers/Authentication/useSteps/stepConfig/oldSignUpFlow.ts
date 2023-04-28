// authentication
import { handleOnSSOClick } from 'services/singleSignOn';
import createAccountWithPassword, {
  Parameters as CreateAccountParameters,
} from 'api/authentication/sign_up/createAccountWithPassword';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import { updateUser } from 'services/users';
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

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
  UpdateState,
} from '../../typings';
import { Step } from './typings';

export const oldSignUpFlow = (
  authenticationData: AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState,
  anySSOProviderEnabled: boolean
) => {
  return {
    // old sign up flow
    'sign-up:auth-providers': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        setCurrentStep('sign-in:auth-providers');
      },
      SELECT_AUTH_PROVIDER: async (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('sign-up:email-password');
          return;
        }

        setStatus('pending');
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          authProvider,
          { ...authenticationData, flow: 'signup' },
          verificationRequired
        );
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
      SUBMIT: async (params: CreateAccountParameters) => {
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
          setError('unknown');
          trackEventByName(tracks.signUpCustomFieldsStepFailed);
        }
      },
      SKIP: async () => {
        setCurrentStep('success');
        trackEventByName(tracks.signUpCustomFieldsStepSkipped);
      },
    },

    'sign-up:invite': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (token: string) => {
        const response = await getUserDataFromToken(token);

        const prefilledBuiltInFields = {
          first_name: response.data.attributes.first_name ?? undefined,
          last_name: response.data.attributes.last_name ?? undefined,
          email: response.data.attributes.email ?? undefined,
        };

        updateState({ token, prefilledBuiltInFields });

        setCurrentStep('sign-up:email-password');
      },
    },
  };
};
