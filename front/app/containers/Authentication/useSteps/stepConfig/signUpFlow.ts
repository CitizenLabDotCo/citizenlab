import getUserDataFromToken from 'api/authentication/getUserDataFromToken';
import createAccountWithPassword, {
  Parameters as CreateAccountParameters,
} from 'api/authentication/sign_up/createAccountWithPassword';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../tracks';
import {
  AuthenticationData,
  GetRequirements,
  UpdateState,
} from '../../typings';

import { Step } from './typings';
import { doesNotMeetGroupCriteria, checkMissingData } from './utils';

export const signUpFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  anySSOProviderEnabled: boolean
) => {
  return {
    'sign-up:email-password': {
      CLOSE: () => {
        setCurrentStep('closed');
        trackEventByName(tracks.signUpEmailPasswordStepExited);
      },
      SWITCH_FLOW: () => {
        updateState({ flow: 'signup' });
        setCurrentStep('sign-in:email-password');
        trackEventByName(tracks.signUpEmailPasswordStepExited);
      },
      GO_BACK: () => {
        if (anySSOProviderEnabled) {
          setCurrentStep('sign-up:auth-providers');
          trackEventByName(tracks.signUpEmailPasswordStepExited);
        }
      },
      SUBMIT: async (params: CreateAccountParameters) => {
        try {
          await createAccountWithPassword(params);

          const { requirements } = await getRequirements();
          const authenticationData = getAuthenticationData();

          const missingDataStep = checkMissingData(
            requirements,
            authenticationData,
            'signup'
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
            // Store email in state to use in taken-by-invite step
            updateState({ email: params.email });

            // Go to step where user can enter invitation token again
            setCurrentStep('taken-by-invite');
          } else {
            trackEventByName(tracks.signInEmailPasswordFailed);
            throw e;
          }
        }
      },
    },

    'sign-up:invite': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (token: string) => {
        const response = await getUserDataFromToken(token);

        const prefilledBuiltInFields = {
          first_name: response.data.attributes.first_name ?? undefined,
          last_name: response.data.attributes.last_name ?? undefined,
          email: response.data.attributes.email ?? undefined,
        };

        updateState({ token, prefilledBuiltInFields });

        setCurrentStep('sign-up:email-password');
      },
    },
  };
};
