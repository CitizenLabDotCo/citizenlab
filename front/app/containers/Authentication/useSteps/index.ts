import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

import { parse } from 'qs';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import getAuthenticationRequirements from 'api/authentication/authentication_requirements/getAuthenticationRequirements';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import { SSOParams } from 'api/authentication/singleSignOn';
import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useModalQueue } from 'containers/App/ModalQueue';
import { invalidateAllActionDescriptors } from 'containers/Authentication/useSteps/invalidateAllActionDescriptors';

import { trackEventByName } from 'utils/analytics';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import {
  triggerAuthenticationFlow$,
  triggerPostParticipationFlow$,
  triggerVerificationOnly$,
} from '../events';
import {
  ErrorCode,
  State,
  StepConfig,
  Step,
  AuthenticationData,
} from '../typings';

import { getStepConfig } from './stepConfig';

let initialized = false;

export default function useSteps() {
  const { pathname, search } = useLocation();
  const { data: authUser } = useAuthUser();
  const { queueModal, removeModal } = useModalQueue();
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  // The authentication data will be initialized with the global sign up flow.
  // In practice, this will be overwritten before firing the flow (see event
  // listeners below). But this is easier typescript-wise
  const authenticationDataRef = useRef<AuthenticationData>({
    context: GLOBAL_CONTEXT,
  });

  const authenticationData = authenticationDataRef.current;

  const getAuthenticationData = useCallback(() => {
    return authenticationDataRef.current;
  }, []);

  const [currentStep, _setCurrentStep] = useState<Step>('closed');

  const setCurrentStep = useCallback(
    (step: Step) => {
      if (step === 'closed') {
        invalidateAllActionDescriptors();
        queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
        removeModal('authentication');
      } else {
        queueModal('authentication');
      }

      trackEventByName('Transition step in authentication flow', { step });

      _setCurrentStep(step);
    },
    [queueModal, removeModal]
  );

  const [state, setState] = useState<State>({
    flow: 'signup',
    email: null,
    /** the invite token, set in case the flow started with an invitation */
    token: null,
    prefilledBuiltInFields: null,
    ssoProvider: null,
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
      return response.data.attributes;
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
      state,
      userConfirmationEnabled
    );
  }, [
    getAuthenticationData,
    getRequirements,
    setCurrentStep,
    setError,
    updateState,
    state,
    userConfirmationEnabled,
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

      const { authenticationData, flow } = event.eventValue;

      authenticationDataRef.current = authenticationData;
      updateState({ flow });

      transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')(flow);
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition, updateState]);

  // Listen for any action that triggers the VERIFICATION flow, and initialize
  // the flow in no flow is ongoing
  useEffect(() => {
    const subscription = triggerVerificationOnly$.subscribe(() => {
      if (currentStep !== 'closed') return;

      authenticationDataRef.current = {
        context: GLOBAL_CONTEXT,
      };

      updateState({ flow: 'signup' });

      transition(currentStep, 'TRIGGER_VERIFICATION_ONLY')();
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition, updateState]);

  // Listen for any action that triggers the post-particpation authentication flow, and initialize
  // the flow if no flow is ongoing
  useEffect(() => {
    const subscription = triggerPostParticipationFlow$.subscribe((event) => {
      if (currentStep !== 'closed') return;

      const { authenticationData } = event.eventValue;
      authenticationDataRef.current = authenticationData;

      updateState({ flow: 'signup' });

      transition(currentStep, 'TRIGGER_POST_PARTICIPATION_FLOW')();
    });

    return () => subscription.unsubscribe();
  }, [currentStep, transition, updateState]);

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
          context: GLOBAL_CONTEXT,
        };

        updateState({ flow: 'signup' });

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
          context: GLOBAL_CONTEXT,
        };

        updateState({ flow: 'signin' });

        transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')('signin');
      }
      return;
    }

    // launch sign up flow, derived from route
    if (pathname.endsWith('/sign-up')) {
      if (isNilOrError(authUser)) {
        authenticationDataRef.current = {
          context: GLOBAL_CONTEXT,
        };

        updateState({ flow: 'signup' });

        transition(currentStep, 'TRIGGER_AUTHENTICATION_FLOW')('signup');
      }
      // Remove all parameters from URL as they've already been captured
      window.history.replaceState(null, '', '/');
      return;
    }

    const urlSearchParams = parse(search, {
      ignoreQueryPrefix: true,
    }) as any;

    // Verification from profile & group based (non-SSO) verification flow
    if (urlSearchParams.verification_error === 'true') {
      transition(
        currentStep,
        'TRIGGER_VERIFICATION_ERROR'
      )(urlSearchParams.error_code);

      // Remove query string from URL as params already been captured
      window.history.replaceState(null, '', pathname);
      return;
    }

    if (urlSearchParams.authentication_error === 'true') {
      transition(currentStep, 'TRIGGER_AUTH_ERROR')(urlSearchParams.error_code);

      // Remove query string from URL as params already been captured
      window.history.replaceState(null, '', pathname);
      return;
    }

    // detect whether we're entering from a redirect of a 3rd party
    // authentication method through an URL param, and launch the corresponding
    // flow
    if (
      urlSearchParams.sso_success === 'true' ||
      urlSearchParams.verification_success === 'true'
    ) {
      const {
        sso_flow,
        sso_verification_action,
        sso_verification_id,
        sso_verification_type,
      } = urlSearchParams as SSOParams;

      // Check if there is a success action in local storage (from SSO or verification)
      const actionFromLocalStorage = localStorage.getItem(
        'auth_success_action'
      );
      localStorage.removeItem('auth_success_action');

      // Check if there is a context in local storage (from verification)
      const contextFromLocalStorage = localStorage.getItem('auth_context');
      localStorage.removeItem('auth_context');

      // Check if there is a path in local storage
      const pathFromLocalStorage = localStorage.getItem(
        'auth_path'
      ) as RouteType;
      localStorage.removeItem('auth_path');

      const context = contextFromLocalStorage
        ? JSON.parse(contextFromLocalStorage)
        : {
            type: sso_verification_type,
            action: sso_verification_action,
            id: sso_verification_id,
          };

      authenticationDataRef.current = {
        successAction:
          actionFromLocalStorage && JSON.parse(actionFromLocalStorage),
        context: context as AuthenticationContext,
      };

      const flow = sso_flow ?? 'signin';
      updateState({ flow, email: authUser.data.attributes.email ?? null });
      transition(currentStep, 'RESUME_FLOW_AFTER_SSO')(flow);

      // Check that the path is the same as the one stored in local storage
      if (pathFromLocalStorage && pathname !== pathFromLocalStorage) {
        clHistory.push(pathFromLocalStorage);
      } else {
        // Remove query string from URL as params already been captured
        window.history.replaceState(null, '', pathname);
      }
    }
  }, [
    pathname,
    search,
    currentStep,
    transition,
    authUser,
    setError,
    updateState,
  ]);

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
