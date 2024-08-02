import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

import { parse } from 'qs';
import { useLocation } from 'react-router-dom';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import getAuthenticationRequirements from 'api/authentication/authentication_requirements/getAuthenticationRequirements';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import { SSOParams } from 'api/authentication/singleSignOn';
import useAuthUser from 'api/me/useAuthUser';

import { invalidateAllActionDescriptors } from 'containers/Authentication/useSteps/invalidateAllActionDescriptors';

import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import { isNil, isNilOrError } from 'utils/helperUtils';

import {
  triggerAuthenticationFlow$,
  triggerVerificationOnly$,
} from '../events';
import {
  ErrorCode,
  State,
  StepConfig,
  Step,
  AuthenticationData,
} from '../typings';
import useAnySSOEnabled from '../useAnySSOEnabled';

import { getStepConfig } from './stepConfig';

let initialized = false;

export default function useSteps() {
  const anySSOEnabled = useAnySSOEnabled();
  const { pathname, search } = useLocation();
  const { data: authUser } = useAuthUser();

  // The authentication data will be initialized with the global sign up flow.
  // In practice, this will be overwritten before firing the flow (see event
  // listeners below). But this is easier typescript-wise
  const authenticationDataRef = useRef<AuthenticationData>({
    flow: 'signup',
    context: GLOBAL_CONTEXT,
  });

  const authenticationData = authenticationDataRef.current;

  const getAuthenticationData = useCallback(() => {
    return authenticationDataRef.current;
  }, []);

  const [currentStep, _setCurrentStep] = useState<Step>('closed');

  const setCurrentStep = useCallback((step: Step) => {
    if (step === 'closed') {
      invalidateAllActionDescriptors();
      queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
    }

    _setCurrentStep(step);
  }, []);

  const [state, setState] = useState<State>({
    email: null,
    /** the invite token, set in case the flow started with an invitation */
    token: null,
    prefilledBuiltInFields: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<ErrorCode | null>(null);

  const setError = useCallback((newError: ErrorCode | null) => {
    _setError((currentError) => {
      if (currentError === null || newError === null) {
        return newError;
      } else {
        return currentError;
      }
    });
  }, []);

  const getRequirements = useCallback(async () => {
    const authenticationContext = getAuthenticationData().context;

    try {
      const response = await getAuthenticationRequirements(
        authenticationContext
      );
      return response.data.attributes.requirements;
    } catch (e) {
      setError('requirements_fetching_failed');
      throw e;
    }
  }, [getAuthenticationData, setError]);

  const updateState = useCallback((newState: Partial<State>) => {
    setState((state) => ({ ...state, ...newState }));
  }, []);

  /** stepConfig defines each step (similar to a state, in a statemachine), and
   * for each step the supported transition functions. It the stepConfig
   * function aggregates all steps from all different flows (in ./stepConfig*)
   * in one big object */
  const stepConfig = useMemo(() => {
    return getStepConfig(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setError,
      updateState,
      anySSOEnabled
    );
  }, [
    getAuthenticationData,
    getRequirements,
    setCurrentStep,
    setError,
    updateState,
    anySSOEnabled,
  ]);

  /** given the current step and a transition supported by that step, performs the transition */
  const transition = useCallback(
    <S extends Step, T extends keyof StepConfig[S]>(
      currentStep: S,
      transition: T
    ) => {
      const action = stepConfig[currentStep][transition];

      const wrappedAction = (async (...args) => {
        setError(null);
        setLoading(true);

        try {
          // @ts-ignore
          await action(...args);
          setLoading(false);
        } catch (e) {
          setLoading(false);
          throw e;
        }
      }) as StepConfig[S][T];

      return wrappedAction;
    },
    [stepConfig, setError]
  );

  // Listen for any action that triggers the authentication flow, and initialize
  // the flow if no flow is ongoing
  useEffect(() => {
    const subscription = triggerAuthenticationFlow$.subscribe((event) => {
      if (currentStep !== 'closed') return;

      authenticationDataRef.current = event.eventValue;

      transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')();
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition]);

  // Listen for any action that triggers the VERIFICATION flow, and initialize
  // the flow in no flow is ongoing
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

  // Logic to launch other flows
  useEffect(() => {
    if (initialized) return;
    if (authUser === undefined) return;
    initialized = true;
    if (currentStep !== 'closed') return;

    // launch invitation flow, derived from route
    if (pathname.endsWith('/invite')) {
      if (isNilOrError(authUser)) {
        authenticationDataRef.current = {
          flow: 'signup',
          context: GLOBAL_CONTEXT,
        };

        transition(currentStep, 'START_INVITE_FLOW')(search);
      }

      // Remove all parameters from URL as they've already been captured
      window.history.replaceState(null, '', '/');
      return;
    }

    // launch sign in flow, derived from route
    if (pathname.endsWith('/sign-in') || pathname.endsWith('/sign-in/admin')) {
      if (isNilOrError(authUser)) {
        authenticationDataRef.current = {
          flow: 'signin',
          context: GLOBAL_CONTEXT,
        };
        transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')();
      }
      return;
    }

    // launch sign up flow, derived from route
    if (pathname.endsWith('/sign-up')) {
      if (isNilOrError(authUser)) {
        authenticationDataRef.current = {
          flow: 'signup',
          context: GLOBAL_CONTEXT,
        };
        transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')();
      }
      // Remove all parameters from URL as they've already been captured
      window.history.replaceState(null, '', '/');
      return;
    }

    const urlSearchParams = parse(search, {
      ignoreQueryPrefix: true,
    }) as any;

    if (urlSearchParams.verification_error === 'true') {
      transition(
        currentStep,
        'TRIGGER_VERIFICATION_ERROR'
      )(urlSearchParams.error);
      return;
    }

    // detect whether we're entering from a redirect of a 3rd party
    // authentication method through an URL param, and launch the corresponding
    // flow
    if (
      urlSearchParams.sso_response === 'true' ||
      urlSearchParams.verification_success === 'true'
    ) {
      const {
        sso_flow,
        sso_pathname,
        sso_verification_action,
        sso_verification_id,
        sso_verification_type,
        error_code,
        verification_success,
      } = urlSearchParams as SSOParams;

      // Check if there is a success action in local storage (from SSO or verification)
      const actionFromLocalStorage = localStorage.getItem(
        'auth_success_action'
      );
      localStorage.removeItem('auth_success_action');

      // Check if there is a context in local storage (from verification)
      const contextFromLocalStorage = localStorage.getItem('auth_context');
      localStorage.removeItem('auth_context');

      const context = contextFromLocalStorage
        ? JSON.parse(contextFromLocalStorage)
        : {
            type: sso_verification_type,
            action: sso_verification_action,
            id: sso_verification_id,
          };

      authenticationDataRef.current = {
        flow: sso_flow || 'signin',
        successAction:
          actionFromLocalStorage && JSON.parse(actionFromLocalStorage),
        context: context as AuthenticationContext,
      };

      if (pathname.endsWith('authentication-error')) {
        transition(currentStep, 'TRIGGER_AUTH_ERROR')(error_code);

        // Remove all parameters from URL as they've already been captured
        window.history.replaceState(null, '', '/');
        return;
      }

      if (sso_pathname) {
        clHistory.replace(sso_pathname);
      } else if (!verification_success) {
        // Remove all parameters from URL as they've already been captured
        window.history.replaceState(null, '', '/');
      }

      const enterEmaillessSsoEmail =
        !isNilOrError(authUser) && isNil(authUser.data.attributes.email);

      transition(currentStep, 'RESUME_FLOW_AFTER_SSO')(enterEmaillessSsoEmail);
    }
  }, [pathname, search, currentStep, transition, authUser, setError]);

  // always show EmaillessSso modal to user
  useEffect(() => {
    if (isNilOrError(authUser)) return;
    if (currentStep !== 'closed') return;
    if (isNil(authUser.data.attributes.email)) {
      transition(currentStep, 'REOPEN_EMAILLESS_SSO')();
    }
  }, [authUser, currentStep, transition]);

  return {
    currentStep,
    state,
    loading,
    error,
    authenticationData,
    transition,
    setError,
  };
}
