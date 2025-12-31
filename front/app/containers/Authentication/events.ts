import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

import eventEmitter from 'utils/eventEmitter';

import { SuccessAction } from './SuccessActions/actions';
import { AuthenticationData } from './typings';

const TRIGGER_AUTHENTICATION_FLOW = 'triggerAuthenticationFlow';

type Event = {
  authenticationData: AuthenticationData;
  flow: 'signup' | 'signin';
};

// General auth flow
export function triggerAuthenticationFlow(
  partialAuthenticationData?: Partial<AuthenticationData>,
  flow: 'signup' | 'signin' = 'signin'
) {
  const authenticationData: AuthenticationData = {
    context: partialAuthenticationData?.context ?? GLOBAL_CONTEXT,
    successAction: partialAuthenticationData?.successAction,
  };

  const event: Event = {
    authenticationData,
    flow,
  };

  eventEmitter.emit(TRIGGER_AUTHENTICATION_FLOW, event);
}

export const triggerAuthenticationFlow$ = eventEmitter.observeEvent<Event>(
  TRIGGER_AUTHENTICATION_FLOW
);

// Verification only flow
const TRIGGER_VERIFICATION_ONLY = 'triggerVerificationOnly';

export function triggerVerificationOnly() {
  eventEmitter.emit(TRIGGER_VERIFICATION_ONLY);
}

export const triggerVerificationOnly$ = eventEmitter.observeEvent<undefined>(
  TRIGGER_VERIFICATION_ONLY
);

// Post-participation flow
const TRIGGER_POST_PARTICIPATION_FLOW = 'triggerPostParticipationFlow';

export function triggerPostParticipationFlow(successAction: SuccessAction) {
  const authenticationData: AuthenticationData = {
    context: GLOBAL_CONTEXT,
    successAction,
  };

  const event: Event = {
    authenticationData,
    flow: 'signup',
  };

  eventEmitter.emit(TRIGGER_POST_PARTICIPATION_FLOW, event);
}

export const triggerPostParticipationFlow$ = eventEmitter.observeEvent<Event>(
  TRIGGER_POST_PARTICIPATION_FLOW
);
