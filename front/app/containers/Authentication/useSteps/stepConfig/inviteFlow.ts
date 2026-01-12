import createAccountFromInvite, {
  Parameters as CreateAccountFromInviteParameters,
} from 'api/authentication/createAccountFromInvite';
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

import {
  AuthenticationData,
  GetRequirements,
  UpdateState,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

export const inviteFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  return {
    'invite:email-password': {
      CLOSE: () => {
        setCurrentStep('closed');
      },
      SUBMIT: async (params: CreateAccountFromInviteParameters) => {
        try {
          await createAccountFromInvite(params);

          const { requirements } = await getRequirements();
          const authenticationData = getAuthenticationData();

          const missingDataStep = checkMissingData(
            requirements,
            authenticationData,
            'signup',
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
        } catch (e) {
          if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
            // If the invitation is already taken:
            // Store email in state to use in invite:taken step
            updateState({ email: params.email });

            // Go to step where user can enter invitation token again
            setCurrentStep('invite:taken');
          } else {
            throw e;
          }
        }
      },
    },

    'invite:code': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (token: string) => {
        const response = await getUserDataFromToken(token);

        const prefilledBuiltInFields = {
          first_name: response.data.attributes.first_name ?? undefined,
          last_name: response.data.attributes.last_name ?? undefined,
          email: response.data.attributes.email ?? undefined,
        };

        updateState({ token, prefilledBuiltInFields });

        setCurrentStep('invite:email-password');
      },
    },

    'invite:taken': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
