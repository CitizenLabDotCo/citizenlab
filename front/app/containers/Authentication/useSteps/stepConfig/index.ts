// flows
import { sharedSteps } from './sharedSteps';
import { oldSignInFlow } from './oldSignInFlow';
import { oldSignUpFlow } from './oldSignUpFlow';
import { newLightFlow } from './newLightFlow';
import { missingDataFlow } from './missingDataFlow';

// typings
import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SetError,
} from '../../typings';
import { Step } from './typings';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean
) => {
  return {
    ...sharedSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setError,
      updateState,
      anySSOEnabled
    ),

    ...oldSignInFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      anySSOEnabled
    ),

    ...oldSignUpFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      anySSOEnabled
    ),

    ...newLightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState
    ),

    ...missingDataFlow(getRequirements, setCurrentStep),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'),
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
