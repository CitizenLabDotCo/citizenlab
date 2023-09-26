// authentication
import { handleOnSSOClick } from 'services/singleSignOn';
import createAccountWithPassword, {
  Parameters as CreateAccountParameters,
} from 'api/authentication/sign_up/createAccountWithPassword';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';
import { updateUser } from 'api/users/useUpdateUser';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { askCustomFields, showOnboarding } from './utils';

// typings
import {
  AuthenticationData,
  AuthProvider,
  GetRequirements,
  UpdateState,
} from '../../typings';
import { Step } from './typings';
import { UseMutateFunction } from '@tanstack/react-query';
import { IUser, IUserUpdate } from 'api/users/types';
import { CLErrorsWrapper } from 'typings';

export const signUpFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  anySSOProviderEnabled: boolean,
  updateUser: UseMutateFunction<IUser, CLErrorsWrapper, IUserUpdate>
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

        const { requirements } = await getRequirements();
        const verificationRequired =
          requirements.special.verification === 'require';

        handleOnSSOClick(
          authProvider,
          { ...getAuthenticationData(), flow: 'signup' },
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
        try {
          await createAccountWithPassword(params);
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

          if (showOnboarding(requirements.onboarding)) {
            setCurrentStep('sign-up:onboarding');
            return;
          }

          if (requirements.special.group_membership === 'require') {
            setCurrentStep('closed');
            return;
          }

          setCurrentStep('success');
        } catch (e) {
          trackEventByName(tracks.signInEmailPasswordFailed);
          throw e;
        }
      },
    },

    'sign-up:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: () => {
        setCurrentStep('sign-up:change-email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (requirements.special.verification === 'require') {
          setCurrentStep('sign-up:verification');
          return;
        }

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
    },

    'sign-up:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => {
        setCurrentStep('sign-up:email-confirmation');
      },
      RESEND_CODE: async (newEmail: string) => {
        await resendEmailConfirmationCode(newEmail);
        setCurrentStep('sign-up:email-confirmation');
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

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
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
        try {
          await updateUser({ userId, custom_field_values: formData });

          const { requirements } = await getRequirements();

          if (showOnboarding(requirements.onboarding)) {
            setCurrentStep('sign-up:onboarding');
            return;
          }

          if (requirements.special.group_membership === 'require') {
            setCurrentStep('closed');
            return;
          }

          setCurrentStep('success');
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);
        } catch (e) {
          trackEventByName(tracks.signUpCustomFieldsStepFailed);
          throw e;
        }
      },
      SKIP: async () => {
        const { requirements } = await getRequirements();

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
        trackEventByName(tracks.signUpCustomFieldsStepSkipped);
      },
    },

    'sign-up:onboarding': {
      CLOSE: () => {
        setCurrentStep('closed');
        trackEventByName(tracks.signUpCustomFieldsStepExited);
      },
      SUBMIT: async (userId: string, onboarding: OnboardingType) => {
        try {
          await updateUser({ userId, onboarding });
          const { requirements } = await getRequirements();

          if (requirements.special.group_membership === 'require') {
            setCurrentStep('closed');
            return;
          }

          setCurrentStep('success');
          trackEventByName(tracks.signUpCustomFieldsStepCompleted);
        } catch (e) {
          trackEventByName(tracks.signUpCustomFieldsStepFailed);
          throw e;
        }
      },
      SKIP: async () => {
        const { requirements } = await getRequirements();

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
        trackEventByName(tracks.signUpOnboardingStepSkipped);
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
