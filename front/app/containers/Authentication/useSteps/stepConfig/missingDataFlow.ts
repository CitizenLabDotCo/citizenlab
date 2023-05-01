// api
import { updateUser } from 'services/users';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import getAuthUser from 'api/authentication/auth_user/getAuthUser';
import signOut from 'api/authentication/sign_in_out/signOut';

// utils
import { requiredCustomFields, requiredBuiltInFields } from './utils';

// typings
import { GetRequirements, Status } from 'containers/Authentication/typings';
import { Step, BuiltInFieldsUpdate } from './typings';

export const missingDataFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void
) => {
  return {
    'missing-data:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        const authUser = await getAuthUser();

        if (authUser.data.attributes.no_password) {
          await signOut();
          setCurrentStep('closed');
        } else {
          setCurrentStep('missing-data:change-email');
        }
      },
      SUBMIT_CODE: async (code: string) => {
        setStatus('pending');

        try {
          await confirmEmail({ code });
          const { requirements } = await getRequirements();

          setStatus('ok');

          if (requiredBuiltInFields(requirements)) {
            setCurrentStep('missing-data:built-in');
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

    'missing-data:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => {
        setCurrentStep('missing-data:email-confirmation');
      },
      RESEND_CODE: async (newEmail: string) => {
        setStatus('pending');

        try {
          await resendEmailConfirmationCode(newEmail);
          setCurrentStep('missing-data:email-confirmation');
          setStatus('ok');
        } catch (e) {
          setError('unknown');
        }
      },
    },

    'missing-data:built-in': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (
        userId: string,
        builtInFieldUpdate: BuiltInFieldsUpdate
      ) => {
        setStatus('pending');

        await updateUser(userId, builtInFieldUpdate);
        const { requirements } = await getRequirements();

        setStatus('ok');

        if (requirements.special.verification === 'require') {
          setCurrentStep('missing-data:verification');
          return;
        }

        if (requiredCustomFields(requirements.custom_fields)) {
          setCurrentStep('missing-data:custom-fields');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();

        if (requiredCustomFields(requirements.custom_fields)) {
          setCurrentStep('missing-data:custom-fields');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:custom-fields': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (userId: string, formData: FormData) => {
        setStatus('pending');

        try {
          await updateUser(userId, { custom_field_values: formData });
          setStatus('ok');
          setCurrentStep('success');
        } catch {
          setError('unknown');
        }
      },
      SKIP: async () => {
        setCurrentStep('success');
      },
    },
  };
};
