import eventEmitter from 'utils/eventEmitter';
import { ISignUpInMetaData } from 'components/SignUpIn';

enum SignUpInModalEvents {
  open = 'openSignUpInModal',
  close = 'closeSignUpInModal'
}

export function openSignUpInModal(metaData?: Partial<ISignUpInMetaData>) {
  eventEmitter.emit<ISignUpInMetaData>(SignUpInModalEvents.open, {
    flow: metaData?.flow || 'signup',
    pathname: metaData?.pathname || window.location.pathname,
    verification: metaData?.verification ?? false,
    action: metaData?.action || undefined
  });
}

export function closeSignUpInModal() {
  eventEmitter.emit(SignUpInModalEvents.close);
}

export const openSignUpInModal$ = eventEmitter.observeEvent<ISignUpInMetaData>(SignUpInModalEvents.open);

export const closeSignUpInModal$ = eventEmitter.observeEvent(SignUpInModalEvents.close);
