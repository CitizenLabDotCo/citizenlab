// api
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import getAuthUser from 'api/authentication/auth_user/getAuthUser';
import signOut from 'api/authentication/sign_in_out/signOut';

import { UseMutateFunction } from '@tanstack/react-query';
import { IUser, IUserUpdate } from 'api/users/types';
import { CLErrorsWrapper } from 'typings';

// utils
import { requiredCustomFields, requiredBuiltInFields } from './utils';

// typings
import { GetRequirements } from 'containers/Authentication/typings';
import { Step, BuiltInFieldsUpdate } from './typings';

export const missingDataFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateUser: UseMutateFunction<IUser, CLErrorsWrapper, IUserUpdate>
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
        await confirmEmail({ code });
        const { requirements } = await getRequirements();

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

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      GO_BACK: () => {
        setCurrentStep('missing-data:email-confirmation');
      },
      RESEND_CODE: async (newEmail: string) => {
        await resendEmailConfirmationCode(newEmail);
        setCurrentStep('missing-data:email-confirmation');
      },
    },

    'missing-data:built-in': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (
        userId: string,
        builtInFieldUpdate: BuiltInFieldsUpdate
      ) => {
        updateUser(
          {
            userId,
            ...builtInFieldUpdate,
          },
          {
            onSuccess: async () => {
              const { requirements } = await getRequirements();

              if (requirements.special.verification === 'require') {
                setCurrentStep('missing-data:verification');
                return;
              }

              if (requiredCustomFields(requirements.custom_fields)) {
                setCurrentStep('missing-data:custom-fields');
                return;
              }

              if (requirements.special.group_membership === 'require') {
                setCurrentStep('closed');
                return;
              }
            },
          }
        );
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

        if (requirements.special.group_membership === 'require') {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:custom-fields': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (userId: string, formData: FormData) => {
        updateUser(
          { userId, custom_field_values: formData },
          {
            onSuccess: async () => {
              const { requirements } = await getRequirements();

              if (requirements.special.group_membership === 'require') {
                setCurrentStep('closed');
                return;
              }

              setCurrentStep('success');
            },
          }
        );
      },
      SKIP: async () => {
        setCurrentStep('success');
      },
    },
  };
};
