import { useState, useCallback, useMemo } from 'react';

// api
import getAuthenticationRequirements from 'api/permissions/getAuthenticationRequirements';

// utils
import { getStepConfig } from './stepConfig';

// typings
import { Status, ErrorCode, State, StepConfig, Step } from '../typings';
import { AuthenticationContext } from 'api/permissions/types';

export default function useSteps(
  authenticationContext: AuthenticationContext,
  endAuthenticationFlow: () => void
) {
  const [currentStep, _setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({ email: null });
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getRequirements = useCallback(async () => {
    const response = await getAuthenticationRequirements(authenticationContext);
    return response.data.requirements.requirements;
  }, [authenticationContext]);

  const updateState = useCallback((newState: Partial<State>) => {
    setState((state) => ({ ...state, ...newState }));
  }, []);

  const setCurrentStep = useCallback(
    (step: Step) => {
      if (step === 'closed') {
        endAuthenticationFlow();
      }
    },
    [endAuthenticationFlow]
  );

  const stepConfig = useMemo(
    () =>
      getStepConfig(
        getRequirements,
        setCurrentStep,
        setStatus,
        setError,
        updateState
      ),
    [getRequirements, updateState]
  );

  const transition = <S extends Step, T extends keyof StepConfig[S]>(
    currentStep: S,
    transition: T
  ) => {
    const action = stepConfig[currentStep][transition];

    const wrappedAction = ((...args) => {
      setError(null);
      // @ts-ignore
      action(...args);
    }) as StepConfig[S][T];

    return wrappedAction;
  };

  return {
    currentStep,
    state,
    status,
    error,
    transition,
  };
}
