import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

import eventEmitter from 'utils/eventEmitter';

import { AuthenticationData } from './typings';

const TRIGGER_AUTHENTICATION_FLOW = 'triggerAuthenticationFlow';

export function triggerAuthenticationFlow(
  partialAuthenticationData?: Partial<AuthenticationData>
) {
  const authenticationData: AuthenticationData = {
    flow: partialAuthenticationData?.flow ?? 'signup',
    context: partialAuthenticationData?.context ?? GLOBAL_CONTEXT,
    successAction: partialAuthenticationData?.successAction,
  };

  eventEmitter.emit(TRIGGER_AUTHENTICATION_FLOW, authenticationData);
}

export const triggerAuthenticationFlow$ =
  eventEmitter.observeEvent<AuthenticationData>(TRIGGER_AUTHENTICATION_FLOW);

const TRIGGER_VERIFICATION_ONLY = 'triggerVerificationOnly';

export function triggerVerificationOnly() {
  eventEmitter.emit(TRIGGER_VERIFICATION_ONLY);
}

export const triggerVerificationOnly$ = eventEmitter.observeEvent<undefined>(
  TRIGGER_VERIFICATION_ONLY
);
