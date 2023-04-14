import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// api
import getAuthenticationRequirements from 'api/authentication/authentication_requirements/getAuthenticationRequirements';

// hooks
import useAnySSOEnabled from '../useAnySSOEnabled';
import { useLocation } from 'react-router-dom';

// utils
import { getStepConfig } from './stepConfig';

// events
import {
  triggerAuthenticationFlow$,
  triggerVerificationOnly$,
} from '../events';

// constants
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/types';

// typings
import {
  Status,
  ErrorCode,
  State,
  StepConfig,
  Step,
  AuthenticationData,
} from '../typings';

let initialized = false;

export default function useSteps() {
  const anySSOEnabled = useAnySSOEnabled();
  const { pathname, search } = useLocation();

  const authenticationDataRef = useRef<AuthenticationData | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({ email: null, token: null });
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getAuthenticationData = useCallback(() => {
    const authenticationData = authenticationDataRef.current;

    // This should never be possible
    if (!authenticationData) {
      throw new Error('Authentication data not available.');
    }

    return authenticationData;
  }, []);

  const getRequirements = useCallback(async () => {
    const authenticationContext = authenticationDataRef.current?.context;

    // This should never be possible
    if (!authenticationContext) {
      throw new Error('Authentication context not available.');
    }

    try {
      const response = await getAuthenticationRequirements(
        authenticationContext
      );
      return response.data.attributes.requirements;
    } catch (e) {
      setStatus('error');
      setError('requirements_fetching_failed');

      throw e;
    }
  }, []);

  const updateState = useCallback((newState: Partial<State>) => {
    setState((state) => ({ ...state, ...newState }));
  }, []);

  const stepConfig = useMemo(() => {
    return getStepConfig(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState,
      anySSOEnabled
    );
  }, [getAuthenticationData, getRequirements, updateState, anySSOEnabled]);

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

  useEffect(() => {
    const subscription = triggerVerificationOnly$.subscribe(() => {
      if (currentStep !== 'closed') return;
      transition(currentStep, 'TRIGGER_VERIFICATION_ONLY')();
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition]);

  useEffect(() => {
    if (initialized) return;
    initialized = true;
    if (currentStep !== 'closed') return;

    if (pathname.endsWith('/invite')) {
      authenticationDataRef.current = {
        flow: 'signup',
        context: GLOBAL_CONTEXT,
      };

      transition(currentStep, 'START_INVITE_FLOW')(search);

      // Remove all parameters from URL as they've already been captured
      window.history.replaceState(null, '', '/');
      return;
    }
  }, [pathname, search, currentStep, transition]);

  return {
    currentStep,
    state,
    status,
    error,
    authenticationData: authenticationDataRef.current,
    transition,
    setError,
  };
}
