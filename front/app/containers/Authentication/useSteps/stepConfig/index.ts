// flows
import { lightFlow } from './lightFlow';
import { missingDataFlow } from './missingDataFlow';
import { sharedSteps } from './sharedSteps';
import { signInFlow } from './signInFlow';
import { signUpFlow } from './signUpFlow';
import { claveUnicaFlow } from './claveUnicaFlow';

// typings
import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SetError,
} from '../../typings';
import { Step } from './typings';
import { UseMutateFunction } from '@tanstack/react-query';
import { IUser, IUserUpdate } from 'api/users/types';
import { CLErrorsWrapper } from 'typings';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean,
  updateUser: UseMutateFunction<IUser, CLErrorsWrapper, IUserUpdate>
) => {
  return {
    ...lightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState
    ),

    ...missingDataFlow(getRequirements, setCurrentStep, updateUser),

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
      anySSOEnabled
    ),

    ...signUpFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      anySSOEnabled
    ),

    ...claveUnicaFlow(getRequirements, setCurrentStep, updateUser),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'),
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
