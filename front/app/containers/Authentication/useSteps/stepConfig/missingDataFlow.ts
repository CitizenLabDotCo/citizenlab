import requirementKeys from 'api/authentication/authentication_requirements/keys';
import { confirmEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { updateEmailUnconfirmed } from 'api/authentication/updateEmailUnconfirmed';
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
  state: State,
  userConfirmationEnabled: boolean
) => {
  return {
    'missing-data:email-confirmation': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('email:start');
      },
      SUBMIT_CODE: async (_: string, code: string) => {
        await confirmEmailConfirmationCodeChangeEmail(code);
        await queryClient.invalidateQueries(requirementKeys.all());

        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = checkMissingData(
          requirements,
          authenticationData,
          state.flow,
          true
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
      RESEND_CODE: async () => {
        await requestEmailConfirmationCodeChangeEmail();
      },
    },

    'missing-data:built-in': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (
        userId: string,
        { email, ...restBuiltInFieldUpdate }: BuiltInFieldsUpdate
      ) => {
        if (email) {
          if (userConfirmationEnabled) {
            await requestEmailConfirmationCodeChangeEmail(email);
          } else {
            await updateEmailUnconfirmed(email);
          }
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
          state.flow,
          true
        );

        if (missingDataStep) {
          if (missingDataStep === 'missing-data:email-confirmation' && email) {
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
          state.flow,
          true
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
