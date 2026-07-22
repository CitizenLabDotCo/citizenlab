import { requestCodeNewEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { requestCodeNewPhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { OnboardingType } from 'api/users/types';
import {
  updateUser,
  invalidateCacheAfterUpdateUser,
} from 'api/users/useUpdateUser';

import {
  AuthenticationData,
  GetRequirements,
  State,
  UpdateState,
} from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';
import { isNil } from 'utils/helperUtils';

import { Step, BuiltInFieldsUpdate } from './typings';
import {
  showOnboarding,
  doesNotMeetGroupCriteria,
  checkMissingData,
} from './utils';

const isEmpty = (obj: Record<string, unknown>) => {
  if (Object.keys(obj).length === 0) {
    return true;
  }

  for (const key in obj) {
    if (!isNil(obj[key])) {
      return false;
    }
  }

  return true;
};

export const missingDataFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  state: State
) => {
  return {
    // The user has a pending new_email (email_action_required is confirm_new_email)
    // but wants to enter a different one. Requirements can't express "re-provide",
    // so this is a dedicated step with its own email-only form (ChangeEmail).
    'missing-data:change-email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (email: string) => {
        await requestCodeNewEmail(email);
        updateState({ email });
        invalidateCacheAfterUpdateUser(queryClient);
        setCurrentStep('confirmation:new_email');
      },
    },

    'missing-data:phone': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (phone: string) => {
        updateState({ phone });
        await requestCodeNewPhone({ newPhone: phone });
        invalidateCacheAfterUpdateUser(queryClient);
        setCurrentStep('confirmation:new_phone');
      },
    },

    'missing-data:built-in': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (
        userId: string,
        { email, ...restBuiltInFieldUpdate }: BuiltInFieldsUpdate
      ) => {
        if (email) {
          await requestCodeNewEmail(email);
        }

        if (!isEmpty(restBuiltInFieldUpdate)) {
          await updateUser({
            userId,
            ...restBuiltInFieldUpdate,
          });
        }

        invalidateCacheAfterUpdateUser(queryClient);

        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow
        );

        if (missingDataStep) {
          if (missingDataStep === 'confirmation:new_email' && email) {
            updateState({ email });
          }

          setCurrentStep(missingDataStep);
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('access-denied');
          return;
        }

        setCurrentStep('success');
      },
    },

    'missing-data:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow
        );

        if (missingDataStep) {
          setCurrentStep(missingDataStep);
          return;
        }

        if (doesNotMeetGroupCriteria(requirements)) {
          setCurrentStep('access-denied');
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
          setCurrentStep('access-denied');
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
          setCurrentStep('access-denied');
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
