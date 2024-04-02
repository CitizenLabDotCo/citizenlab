import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import {
  updateUser,
  invalidateCacheAfterUpdateUser,
} from 'api/users/useUpdateUser';

import { GetRequirements } from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { Step } from './typings';
import { askCustomFields, showOnboarding } from './utils';

export const claveUnicaFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void
) => {
  return {
    'clave-unica:email': {
      SUBMIT_EMAIL: async ({
        email,
        userId,
      }: {
        email: string;
        userId: string;
      }) => {
        const { requirements } = await getRequirements();
        if (requirements.special.confirmation === 'require') {
          await resendEmailConfirmationCode(email);
          setCurrentStep('clave-unica:email-confirmation');
        } else {
          await updateUser({ userId, email });
          invalidateCacheAfterUpdateUser(queryClient);
          setCurrentStep('success');
        }
      },
    },
    'clave-unica:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('clave-unica:email');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmEmail({ code });

        const { requirements } = await getRequirements();

        if (askCustomFields(requirements.custom_fields)) {
          setCurrentStep('sign-up:custom-fields');
          return;
        }

        if (showOnboarding(requirements.onboarding)) {
          setCurrentStep('sign-up:onboarding');
          return;
        }

        setCurrentStep('success');
      },
    },
  };
};
