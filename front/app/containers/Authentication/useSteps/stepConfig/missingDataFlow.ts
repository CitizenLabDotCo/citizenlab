import getAuthUser from 'api/authentication/auth_user/getAuthUser';
import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import signOut from 'api/authentication/sign_in_out/signOut';
import { OnboardingType } from 'api/users/types';
import {
  updateUser,
  invalidateCacheAfterUpdateUser,
} from 'api/users/useUpdateUser';

import { GetRequirements } from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { Step, BuiltInFieldsUpdate } from './typings';
import {
  showOnboarding,
  doesNotMeetGroupCriteria,
  checkMissingData,
} from './utils';

export const missingDataFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void
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

        const missingDataStep = checkMissingData(requirements);

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
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
        await updateUser({ userId, ...builtInFieldUpdate });
        invalidateCacheAfterUpdateUser(queryClient);

        const { requirements } = await getRequirements();

        const missingDataStep = checkMissingData(requirements);

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('closed');
          return;
        }
      },
    },

    'missing-data:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();

        const missingDataStep = checkMissingData(requirements);

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:custom-fields': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (userId: string, formData: FormData) => {
        await updateUser({ userId, custom_field_values: formData });
        invalidateCacheAfterUpdateUser(queryClient);

        const { requirements } = await getRequirements();

        if (showOnboarding(requirements)) {
          setCurrentStep('missing-data:onboarding');
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
      SKIP: async () => {
        const { requirements } = await getRequirements();

        if (showOnboarding(requirements)) {
          setCurrentStep('missing-data:onboarding');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:onboarding': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (userId: string, onboarding: OnboardingType) => {
        await updateUser({ userId, onboarding });
        invalidateCacheAfterUpdateUser(queryClient);

        const { requirements } = await getRequirements();

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('closed');
          return;
        }

        setCurrentStep('success');
      },
      SKIP: async () => {
        setCurrentStep('success');
      },
    },
  };
};
