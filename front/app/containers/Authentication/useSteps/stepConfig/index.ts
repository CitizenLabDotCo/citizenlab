import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SetError,
  State,
} from '../../typings';

import { lightFlow } from './lightFlow';
import { missingDataFlow } from './missingDataFlow';
import { sharedSteps } from './sharedSteps';
import { signInFlow } from './signInFlow';
import { signUpFlow } from './signUpFlow';
import { ssoVerificationFlow } from './ssoVerificationFlow';
import { Step } from './typings';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean,
  state: State
) => {
  return {
    ...lightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      state
    ),

    ...missingDataFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      state
    ),

    ...sharedSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setError,
      updateState,
      anySSOEnabled
    ),

    ...signInFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      anySSOEnabled
    ),

    ...signUpFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      anySSOEnabled
    ),

    ...ssoVerificationFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState
    ),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'),
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },

    'invitation-resent': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT_CODE: async (token: string) => {
        const response = await getUserDataFromToken(token);
        const { attributes } = response.data;

        const updatedState = {
          first_name: attributes.first_name ?? state.first_name ?? null,
          last_name: attributes.last_name ?? state.last_name ?? null,
        };

        updateState(updatedState);

        setCurrentStep('sign-up:email-password');
      },
    },
  };
};
