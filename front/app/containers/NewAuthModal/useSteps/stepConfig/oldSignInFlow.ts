// authentication
import signIn from 'api/authentication/sign_in_out/signIn';
import { handleOnSSOClick } from 'services/singleSignOn';
import { updateUser } from 'services/users';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { requiredCustomFields } from './utils';

// typings
import {
  Status,
  ErrorCode,
  AuthenticationData,
  AuthProvider,
  GetRequirements,
} from '../../typings';
import { Step } from './typings';

export const oldSignInFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
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

        setStatus('pending');
        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';
        handleOnSSOClick(
          authProvider,
          getAuthenticationData(),
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
        setStatus('pending');

        try {
          await signIn({
            email,
            password,
            rememberMe,
            tokenLifetime,
          });

          const { requirements } = await getRequirements();

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('sign-in:email-confirmation');
            return;
          }

          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-in:verification');
            return;
          }

          if (requiredCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-in:custom-fields');
            return;
          }

          setStatus('ok');

          setCurrentStep('closed');

          const { successAction } = getAuthenticationData();
          if (successAction) {
            triggerSuccessAction(successAction);
          }

          trackEventByName(tracks.signInEmailPasswordCompleted);
        } catch {
          setStatus('error');
          setError('wrong_password');
          trackEventByName(tracks.signInEmailPasswordFailed);
        }
      },
    },

    'sign-in:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: () => {
        setCurrentStep('sign-in:change-email');
      },
      SUBMIT_CODE: async (code: string) => {
        setStatus('pending');

        try {
          await confirmEmail({ code });
          setStatus('ok');

          const { requirements } = await getRequirements();

          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-in:verification');
            return;
          }

          if (requiredCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-in:custom-fields');
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

    'sign-in:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => {
        setCurrentStep('sign-in:email-confirmation');
      },
      RESEND_CODE: async (newEmail: string) => {
        setStatus('pending');

        try {
          await resendEmailConfirmationCode(newEmail);
          setCurrentStep('sign-in:email-confirmation');
          setStatus('ok');
        } catch {
          setStatus('error');
          setError('unknown');
        }
      },
    },

    'sign-in:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();

        if (requiredCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-in:custom-fields');
          return;
        }

        setCurrentStep('success');
      },
    },

    'sign-in:custom-fields': {
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
