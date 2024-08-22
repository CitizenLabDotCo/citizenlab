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
          { ...getAuthenticationData(), flow: 'signup' },
          requirements.verification
        );
      },
    },

    'sign-up:email-password': {
      CLOSE: () => {
        setCurrentStep('closed');
        trackEventByName(tracks.signUpEmailPasswordStepExited);
      },
      SWITCH_FLOW: () => {
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
          const { flow } = getAuthenticationData();

          const missingDataStep = checkMissingData(requirements, flow);

          if (missingDataStep) {
            setCurrentStep(missingDataStep);
            return;
          }

          if (doesNotMeetGroupCriteria(requirements)) {
            setCurrentStep('closed');
            return;
          }

          setCurrentStep('success');
        } catch (e) {
          trackEventByName(tracks.signInEmailPasswordFailed);
          throw e;
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
