import eventEmitter from 'utils/eventEmitter';
import { AuthenticationContext } from 'api/permissions/types';

const EVENT_NAME = 'triggerAuthenticationFlow';

export function triggerAuthenticationFlow(
  authenticationContext: AuthenticationContext
) {
  eventEmitter.emit(EVENT_NAME, authenticationContext);
}

export const triggerAuthenticationFlow$ =
  eventEmitter.observeEvent<AuthenticationContext>(EVENT_NAME);
