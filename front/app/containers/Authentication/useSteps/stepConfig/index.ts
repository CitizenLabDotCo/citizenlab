// flows
import { sharedSteps } from './sharedSteps';
import { oldSignInFlow } from './oldSignInFlow';
import { oldSignUpFlow } from './oldSignUpFlow';
import { newLightFlow } from './newLightFlow';
import { missingDataFlow } from './missingDataFlow';

// typings
import {
  GetRequirements,
  Status,
  ErrorCode,
  UpdateState,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState,
  anySSOEnabled: boolean
) => {
  return {
    ...sharedSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      updateState,
      anySSOEnabled
    ),

    ...oldSignInFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      anySSOEnabled
    ),

    ...oldSignUpFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState,
      anySSOEnabled
    ),

    ...newLightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState
    ),

    ...missingDataFlow(getRequirements, setCurrentStep, setStatus, setError),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'),
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
