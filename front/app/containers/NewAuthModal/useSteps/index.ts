import { useState, useCallback, useMemo, useEffect } from 'react';

// events
import { triggerAuthenticationFlow$ } from '../events';

// hooks
import useGetAuthenticationRequirements from 'api/permissions/getAuthenticationRequirements';

// utils
import { getStepConfig } from './stepConfig';

// typings
import { Status, ErrorCode, State, StepConfig, Step } from '../typings';
import { AuthenticationContext } from 'api/permissions/types';

export default function useSteps() {
  const [authenticationContext, setAuthenticationContext] =
    useState<AuthenticationContext>();

  useEffect(() => {
    triggerAuthenticationFlow$.subscribe((event) => {
      setAuthenticationContext(event.eventValue);
    });
  }, []);

  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({ email: null });
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getAuthenticationRequirements = useGetAuthenticationRequirements();

  const getRequirements = useCallback(async () => {
    const response = await getAuthenticationRequirements();
    return response.data.requirements.requirements;
  }, [getAuthenticationRequirements]);

  const updateState = useCallback((newState: Partial<State>) => {
    setState((state) => ({ ...state, ...newState }));
  }, []);

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
