import confirmEmail from 'api/authentication/confirm_email/confirmEmail';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import {
  updateUser,
  invalidateCacheAfterUpdateUser,
} from 'api/users/useUpdateUser';

import {
  GetRequirements,
  UpdateState,
} from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { Step } from './typings';
import { askCustomFields, showOnboarding } from './utils';

export const emaillessSsoFlow = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  return {
    'emailless-sso:email': {
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
          setCurrentStep('emailless-sso:email-confirmation');
        } else {
          await updateUser({ userId, email });
          invalidateCacheAfterUpdateUser(queryClient);
          setCurrentStep('success');
        }
        updateState({ email });
      },
    },
    'emailless-sso:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('emailless-sso:email');
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
