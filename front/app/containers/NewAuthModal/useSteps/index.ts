import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// api
import getAuthenticationRequirements from 'api/permissions/getAuthenticationRequirements';

// utils
import { getStepConfig } from './stepConfig';

// events
import { triggerAuthenticationFlow$ } from '../events';

// typings
import {
  Status,
  ErrorCode,
  State,
  StepConfig,
  Step,
  AuthenticationData,
} from '../typings';

export default function useSteps() {
  const authenticationDataRef = useRef<AuthenticationData | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({ email: null });
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getRequirements = useCallback(async () => {
    const authenticationContext = authenticationDataRef.current?.context;

    // This should never be possible
    if (!authenticationContext) {
      throw new Error('Authentication context not available.');
    }

    const response = await getAuthenticationRequirements(authenticationContext);
    return response.data.attributes.requirements.requirements;
  }, []);

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
        updateState,
        authenticationDataRef.current?.onSuccess
      ),
    [getRequirements, updateState]
  );

  const transition = useCallback(
    <S extends Step, T extends keyof StepConfig[S]>(
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
    },
    [stepConfig]
  );

  useEffect(() => {
    const subscription = triggerAuthenticationFlow$.subscribe((event) => {
      if (currentStep !== 'closed') return;

      authenticationDataRef.current = event.eventValue;
      transition(currentStep, 'TRIGGER_REGISTRATION_FLOW')();
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition]);

  return {
    currentStep,
    state,
    status,
    error,
    transition,
  };
}
