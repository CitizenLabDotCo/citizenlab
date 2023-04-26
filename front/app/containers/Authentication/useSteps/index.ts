import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { parse } from 'qs';

// api
import getAuthenticationRequirements from 'api/authentication/authentication_requirements/getAuthenticationRequirements';
import { invalidateAllActionDescriptors } from 'containers/Authentication/useSteps/invalidateAllActionDescriptors';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import { queryClient } from 'utils/cl-react-query/queryClient';

// hooks
import useAnySSOEnabled from '../useAnySSOEnabled';
import { useLocation } from 'react-router-dom';

// utils
import { getStepConfig } from './stepConfig';
import clHistory from 'utils/cl-router/history';

// events
import {
  triggerAuthenticationFlow$,
  triggerVerificationOnly$,
} from '../events';

// constants
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

// typings
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import {
  Status,
  ErrorCode,
  State,
  StepConfig,
  Step,
  AuthenticationData,
} from '../typings';
import { SSOParams } from 'services/singleSignOn';

let initialized = false;

export default function useSteps() {
  const anySSOEnabled = useAnySSOEnabled();
  const { pathname, search } = useLocation();

  const authenticationDataRef = useRef<AuthenticationData | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [state, setState] = useState<State>({
    email: null,
    token: null,
    prefilledBuiltInFields: null,
  });
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
        if (transition === 'CLOSE') {
          invalidateAllActionDescriptors();
          queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
        }

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

      authenticationDataRef.current = {
        flow: 'signup',
        context: GLOBAL_CONTEXT,
      };
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

    const urlSearchParams = parse(search, {
      ignoreQueryPrefix: true,
    }) as any;

    if (urlSearchParams.sso_response === 'true') {
      const {
        sso_flow,
        sso_pathname,
        sso_verification_action,
        sso_verification_id,
        sso_verification_type,
      } = urlSearchParams as SSOParams;

      authenticationDataRef.current = {
        flow: sso_flow,
        context: {
          type: sso_verification_type,
          action: sso_verification_action,
          id: sso_verification_id,
        } as AuthenticationContext,
      };

      if (sso_pathname) {
        clHistory.replace(sso_pathname);
      }

      transition(currentStep, 'RESUME_FLOW_AFTER_SSO')();
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
