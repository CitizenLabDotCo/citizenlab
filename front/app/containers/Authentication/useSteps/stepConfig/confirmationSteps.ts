import requirementKeys from 'api/authentication/authentication_requirements/keys';
import {
  confirmCodeMergeAccount,
  confirmCodeNewEmail,
  reconfirmCodeEmail,
} from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import {
  requestCodeNewEmail,
  requestReconfirmCodeEmail,
} from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import {
  confirmCodeNewPhone,
  reconfirmCodePhone,
} from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import {
  requestCodeNewPhone,
  requestReconfirmCodePhone,
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
      SUBMIT_CODE: async (_: string, code: string) => {
        await reconfirmCodeEmail(code);
        await queryClient.invalidateQueries({
          queryKey: requirementKeys.all(),
        });

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
        await requestReconfirmCodeEmail();
      },
    },

    'confirmation:new_email': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('missing-data:change-new-email');
      },
      SUBMIT_CODE: async (_: string, code: string) => {
        await confirmCodeNewEmail(code);
        await queryClient.invalidateQueries({
          queryKey: requirementKeys.all(),
        });

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

    // The email the user supplied already belongs to another account, and a code
    // was sent to that account's inbox. Entering it merges this (email-less, SSO)
    // account into that one and signs the user in as it - so on success this
    // session belongs to a different user than it did a moment ago, and the
    // requirements have to be re-fetched for that user rather than reused.
    'confirmation:merge-account': {
      CLOSE: () => setCurrentStep('closed'),
      CHANGE_EMAIL: async () => {
        setCurrentStep('missing-data:change-new-email');
      },
      SUBMIT_CODE: async (_: string, code: string) => {
        await confirmCodeMergeAccount(code);
        await queryClient.invalidateQueries({
          queryKey: requirementKeys.all(),
        });

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
        // The address has to be passed explicitly: unlike the new_email flow, a
        // merge never writes user.new_email (it belongs to somebody else), so the
        // backend has nothing to fall back on.
        await requestCodeNewEmail(state.new_email ?? undefined);
      },
    },

    // When reconfirming, we don't offer the option to change
    // your phone number.
    'confirmation:reconfirm-phone': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_CODE: async (code: string) => {
        await reconfirmCodePhone(code);
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
        await requestReconfirmCodePhone();
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
