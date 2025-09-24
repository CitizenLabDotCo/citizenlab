import getUserDataFromToken from 'api/authentication/getUserDataFromToken';
import createAccountWithPassword, {
  Parameters as CreateAccountParameters,
} from 'api/authentication/sign_up/createAccountWithPassword';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';

import { trackEventByName } from 'utils/analytics';

import tracks from '../../tracks';
import {
  AuthenticationData,
  AuthProvider,
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
    // old sign up flow
    'sign-up:auth-providers': {
      CLOSE: () => setCurrentStep('closed'),
      SWITCH_FLOW: () => {
        updateState({ flow: 'signin' });
        setCurrentStep('sign-in:auth-providers');
      },
      SELECT_AUTH_PROVIDER: async (authProvider: AuthProvider) => {
        if (authProvider === 'email') {
          setCurrentStep('sign-up:email-password');
          return;
        }

        const { requirements } = await getRequirements();

        handleOnSSOClick(
          authProvider,
          getAuthenticationData(),
          requirements.verification,
          'signup'
        );
      },
    },

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
          if (e.errors?.email?.[0]?.error === 'taken_by_invitee') {
            // If the invitation is already taken:
            // Store provided information
            updateState({
              email: params.email,
              first_name: params.firstName,
              last_name: params.lastName,
              password: params.password,
            });

            // Go to step where user can enter invitation token again
            setCurrentStep('invitation-resent');
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

        const updatedState = {
          token,
          first_name: response.data.attributes.first_name ?? null,
          last_name: response.data.attributes.last_name ?? null,
          email: response.data.attributes.email ?? null,
        };

        updateState(updatedState);

        setCurrentStep('sign-up:email-password');
      },
    },
  };
};
