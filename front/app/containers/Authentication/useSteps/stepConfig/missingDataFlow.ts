import { requestCodeNewEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { requestCodeNewPhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { tooSoonRetryAfter } from 'api/authentication/confirm_phone/resendCooldown';
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
    'missing-data:new_phone': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (new_phone: string, smsManualCampaignConsent: boolean) => {
        updateState({ new_phone, smsManualCampaignConsent });

        try {
          await requestCodeNewPhone(new_phone);
        } catch (e) {
          // A refused resend is not a failure: it means a code for this very
          // number is still outstanding, which is what happens when the user
          // comes back through 'wrong number' and submits the same number
          // again. The code they were sent still works, so carry on to the
          // confirmation step instead of leaving them on the input.
          if (tooSoonRetryAfter(e) === undefined) throw e;
        }

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
          const confirmationType = await requestCodeNewEmail(email);

          // A merge never writes user.new_email, so email_action_required stays
          // `provide_new_email` and checkMissingData below would bounce the user
          // straight back to this form with nothing shown. Go to the code entry
          // directly instead.
          if (confirmationType === 'merge_account') {
            if (!isEmpty(restBuiltInFieldUpdate)) {
              await updateUser({
                userId,
                ...restBuiltInFieldUpdate,
              });
            }

            updateState({ new_email: email });
            invalidateCacheAfterUpdateUser(queryClient);
            setCurrentStep('confirmation:merge-account');
            return;
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

        const missingDataStep = await checkMissingData(
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

    // The user has a pending new_email (email_action_required is confirm_new_email)
    // but wants to enter a different one.
    // We cannot handle this by going back to missing-data:built-in because
    // the email is already marked by requirements API as provided,
    // so the field would never show up in that step.
    'missing-data:change-new-email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (new_email: string) => {
        const confirmationType = await requestCodeNewEmail(new_email);
        updateState({ new_email });
        invalidateCacheAfterUpdateUser(queryClient);
        setCurrentStep(
          confirmationType === 'merge_account'
            ? 'confirmation:merge-account'
            : 'confirmation:new_email'
        );
      },
    },

    'missing-data:verification': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: async () => {
        const { requirements } = await getRequirements();
        const authenticationData = getAuthenticationData();

        const missingDataStep = await checkMissingData(
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
