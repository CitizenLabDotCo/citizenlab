import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// api
import getAuthenticationRequirements from 'api/authentication_requirements/getAuthenticationRequirements';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const viennaCitizenLoginEnabled = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const anySSOProviderEnabled =
    googleLoginEnabled ||
    facebookLoginEnabled ||
    azureAdLoginEnabled ||
    franceconnectLoginEnabled ||
    viennaCitizenLoginEnabled;

  const authenticationDataRef = useRef<AuthenticationData | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({ email: null });
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
      anySSOProviderEnabled
    );
  }, [
    getAuthenticationData,
    getRequirements,
    updateState,
    anySSOProviderEnabled,
  ]);

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
