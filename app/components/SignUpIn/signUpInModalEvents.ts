import eventEmitter from 'utils/eventEmitter';
import { ISignUpInAction } from 'components/SignUpIn';

enum SignUpInModalEvents {
  open = 'openSignUpInModal',
  close = 'closeSignUpInModal'
}

export function openSignUpInModal(action?: ISignUpInAction) {
  eventEmitter.emit(SignUpInModalEvents.open, action);
}

export function closeSignUpInModal() {
  eventEmitter.emit(SignUpInModalEvents.close);
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInAction | undefined>(SignUpInModalEvents.open);

export const closeSignUpInModal$ = eventEmitter.observeEvent(SignUpInModalEvents.close);
