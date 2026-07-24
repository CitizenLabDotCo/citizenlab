import requirementKeys from 'api/authentication/authentication_requirements/keys';
import {
  confirmCodeEmail,
  confirmCodeNewEmail,
} from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import {
  requestCodeEmail,
  requestCodeNewEmail,
} from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { confirmCodeNewPhone } from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import { requestCodeNewPhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { invalidateCacheAfterUpdateUser } from 'api/users/useUpdateUser';

import {
  AuthenticationData,
  GetRequirements,
  State,
} from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

// The code-entry confirmation steps, grouped together because they all do the
// same thing: submit a code that confirms a value and then re-resolve where the
// flow should go next. They correspond one-to-one to the email/phone attributes:
//
//   - confirmation:email      confirms the user's `email` in place
//                             (EmailConfirmation). Used for email signup, for
//                             passwordless login, and for re-confirming an email
//                             whose confirmed_email_expiry has elapsed.
//   - confirmation:new_email  confirms a pending `new_email` (NewEmailConfirmation),
//                             promoting it to `email`.
//   - confirmation:new_phone  confirms a pending `new_phone` (NewPhoneConfirmation),
//                             promoting it to `phone`.
//
// The "provide a value" steps that precede these (email:start / entering a
// number on missing-data:phone / missing-data:change-email) intentionally stay in
// their own flows — this file only holds the confirmation steps.
export const confirmationSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  state: State
) => {
  return {
    'confirmation:email': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('email:start');
      },
      SUBMIT_CODE: async (email: string, code: string) => {
        await confirmCodeEmail(email, code);
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
      RESEND_CODE: async (email: string) => {
        await requestCodeEmail({ email });
      },
    },

    'confirmation:new_email': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('missing-data:change-email');
      },
      SUBMIT_CODE: async (_: string, code: string) => {
        await confirmCodeNewEmail(code);
        await queryClient.invalidateQueries(requirementKeys.all());

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
      RESEND_CODE: async () => {
        await requestCodeNewEmail();
      },
    },

    'confirmation:new_phone': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_PHONE: async () => {
        setCurrentStep('missing-data:phone');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmCodeNewPhone(code);
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

        setCurrentStep('success');
      },
      RESEND_CODE: async (phone: string) => {
        await requestCodeNewPhone({ newPhone: phone });
      },
    },
  };
};
