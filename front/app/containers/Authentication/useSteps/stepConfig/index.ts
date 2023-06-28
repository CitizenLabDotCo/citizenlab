// flows
import { lightFlow } from './lightFlow';
import { missingDataFlow } from './missingDataFlow';
import { sharedSteps } from './sharedSteps';
import { signInFlow } from './signInFlow';
import { signUpFlow } from './signUpFlow';
import { claveUnicaFlow } from './claveUnicaFlow';

// typings
import { GetRequirements, UpdateState, SetError } from '../../typings';
import { Step } from './typings';
import { UseMutateFunction } from '@tanstack/react-query';
import { IUser, IUserUpdate } from 'api/users/types';
import { CLErrorsJSON } from 'typings';

export const getStepConfig = (
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  anySSOEnabled: boolean,
  updateUser: UseMutateFunction<IUser, CLErrorsJSON, IUserUpdate>
) => {
  return {
    ...lightFlow(getRequirements, setCurrentStep, updateState),

    ...missingDataFlow(getRequirements, setCurrentStep, updateUser),

    ...sharedSteps(
      getRequirements,
      setCurrentStep,
      setError,
      updateState,
      anySSOEnabled
    ),

    ...signInFlow(getRequirements, setCurrentStep, anySSOEnabled),

    ...signUpFlow(
      getRequirements,
      setCurrentStep,
      updateState,
      anySSOEnabled,
      updateUser
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
