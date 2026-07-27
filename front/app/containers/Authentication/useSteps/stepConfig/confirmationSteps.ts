import requirementKeys from 'api/authentication/authentication_requirements/keys';
import { confirmCodeNewEmail } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestCodeNewEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
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

// Here we put all the steps related to confirmation email and phone
// EXCEPT the ones that are part of the main email flow
// (i.e. email:unauthenticated-confirmation)
export const confirmationSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  state: State
) => {
  return {
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
