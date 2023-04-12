import eventEmitter from 'utils/eventEmitter';
import { AuthenticationData } from './typings';
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/types';

const EVENT_NAME = 'triggerAuthenticationFlow';

export function triggerAuthenticationFlow(
  partialAuthenticationData?: Partial<AuthenticationData>
) {
  const authenticationData: AuthenticationData = {
    flow: partialAuthenticationData?.flow ?? 'signup',
    context: partialAuthenticationData?.context ?? GLOBAL_CONTEXT,
    successAction: partialAuthenticationData?.successAction,
    error: partialAuthenticationData?.error,
    isInvitation: !!partialAuthenticationData?.isInvitation,
    token: partialAuthenticationData?.token,
    verification: !!partialAuthenticationData?.verification,
  };

  eventEmitter.emit(EVENT_NAME, authenticationData);
}

export const triggerAuthenticationFlow$ =
  eventEmitter.observeEvent<AuthenticationData>(EVENT_NAME);
