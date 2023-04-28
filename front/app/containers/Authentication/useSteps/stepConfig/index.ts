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
  authenticationData: AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState,
  anySSOEnabled: boolean
) => {
  return {
    ...sharedSteps(
      authenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      updateState,
      anySSOEnabled
    ),

    ...oldSignInFlow(
      authenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      anySSOEnabled
    ),

    ...oldSignUpFlow(
      authenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState,
      anySSOEnabled
    ),

    ...newLightFlow(
      authenticationData,
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
