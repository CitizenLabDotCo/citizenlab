import eventEmitter from 'utils/eventEmitter';
import { AuthenticationData } from './typings';

const EVENT_NAME = 'triggerAuthenticationFlow';

export function triggerAuthenticationFlow(
  authenticationData: AuthenticationData
) {
  eventEmitter.emit(EVENT_NAME, authenticationData);
}

export const triggerAuthenticationFlow$ =
  eventEmitter.observeEvent<AuthenticationData>(EVENT_NAME);
