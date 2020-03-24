import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from 'components/SignUpIn';

enum SignUpInModalEvents {
  open = 'openSignUpInModal',
  close = 'closeSignUpInModal'
}

export function openSignUpInModal(metaData: ISignUpInMetaData) {
  eventEmitter.emit(SignUpInModalEvents.open, metaData);
}

export function closeSignUpInModal() {
  eventEmitter.emit(SignUpInModalEvents.close);
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInMetaData>(SignUpInModalEvents.open);

export const closeSignUpInModal$ = eventEmitter.observeEvent(SignUpInModalEvents.close);
