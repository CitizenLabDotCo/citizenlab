import requirementKeys from 'api/authentication/authentication_requirements/keys';
import {
  confirmCodeEmail,
  confirmCodeNewEmail,
} from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import {
  requestCodeEmail,
  requestCodeNewEmail,
} from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import {
  confirmCodePhone,
  confirmCodeNewPhone,
} from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import {
  requestCodePhone,
  requestCodeNewPhone,
} from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { invalidateCacheAfterUpdateUser } from 'api/users/useUpdateUser';

import {
  AuthenticationData,
  GetRequirements,
  State,
} from 'containers/Authentication/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

// Here we put all the steps related to confirmation email and phone
// EXCEPT the ones that are part of the main email flow
// (i.e. pre-auth:unauthenticated-confirmation)
export const confirmationSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  state: State
) => {
  return {
    // When reconfirming, we don't offer the option to change
    // your email.
    'confirmation:reconfirm-email': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_CODE: async (email: string, code: string) => {
        await confirmCodeEmail(email, code);
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
        await requestCodeEmail();
      },
    },

    'confirmation:new_email': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('missing-data:change-new-email');
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

    // When reconfirming, we don't offer the option to change
    // your phone number.
    'confirmation:reconfirm-phone': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_CODE: async (code: string) => {
        await confirmCodePhone(code);
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
      RESEND_CODE: async () => {
        await requestCodePhone();
      },
    },

    'confirmation:new_phone': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_PHONE: async () => {
        setCurrentStep('missing-data:new_phone');
      },
      SUBMIT_CODE: async (code: string) => {
        await confirmCodeNewPhone(code, state.smsManualCampaignConsent);
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
      RESEND_CODE: async (newPhone: string) => {
        await requestCodeNewPhone(newPhone);
      },
    },
  };
};
